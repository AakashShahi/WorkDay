/**
 * User Controller: Handles authentication, registration, and 2FA.
 * Implements security hardening measures against enumeration and brute-force.
 */
const User = require("../models/User")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const nodemailer = require("nodemailer")
const speakeasy = require("speakeasy")
const qrcode = require("qrcode")
const axios = require("axios")
const { logActivity } = require("../utils/auditLogger");

//Registration COntroller
exports.regiterUser = async (req, res) => {
    console.log("Register Body:", req.body);
    const { username, email, name, password, role, profession, skills, location, availability, certificateUrl, isVerified, phone, captchaToken } = req.body

    // 1. Verify Captcha
    if (!captchaToken) {
        console.log("Captcha token missing in registration");
        return res.status(400).json({ success: false, message: "Captcha token is missing" });
    }

    try {
        const googleVerifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captchaToken}`;
        const response = await axios.post(googleVerifyUrl);
        if (!response.data.success) {
            console.log("Captcha verification failed in registration:", response.data);
            await logActivity({
                action: "REGISTRATION",
                status: "FAILURE",
                details: `Captcha verification failed for ${username}`,
                req: req
            });
            return res.status(400).json({ success: false, message: "Captcha verification failed" });
        }
    } catch (error) {
        console.error("Captcha Error in registration:", error);
        return res.status(500).json({ success: false, message: "Captcha verification server error" });
    }

    // 2. Validate Password Complexity (Min 8 chars, 1 Upper, 1 Lower, 1 Number, 1 Special)
    // This ensures security standards are met even if the frontend validation is bypassed.
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
        await logActivity({
            action: "REGISTRATION",
            status: "FAILURE",
            details: `Password complexity validation failed for ${username}`,
            req: req
        });
        return res.status(400).json({
            success: false,
            message: "Password must be at least 8 characters long and include an uppercase letter, a number, and a special character."
        });
    }

    try {
        const existingUser = await User.findOne(
            {
                $or: [{ username: username }, { email: email }]
            }
        )

        if (existingUser) {
            console.log("User already exists:", username, email);
            await logActivity({
                action: "REGISTRATION",
                status: "FAILURE",
                details: `Registration attempted with existing username/email: ${username} / ${email}`,
                req: req
            });
            return res.status(400).json(
                {
                    "success": false, "message": "Email or username already in use"
                }
            )
        }

        const hashedPass = await bcrypt.hash(password, 10)
        const profilePic = req.file?.path


        const newUser = new User(
            {
                username,
                name,
                email,
                password: hashedPass,
                role,
                profession,
                skills,
                location,
                availability,
                certificateUrl,
                isVerified,
                profilePic: profilePic,
                phone: phone
            }
        )

        await newUser.save()
        console.log("User registered successfully:", username);

        await logActivity({
            userId: newUser._id,
            username: newUser.username,
            action: "REGISTRATION",
            status: "SUCCESS",
            details: `New user registered as ${role}: ${username}`,
            req: req
        });

        return res.status(200).json(
            { "success": true, "message": `${role} registered` }
        )

    } catch (error) {
        console.log("Registration Error:", error);
        return res.status(500).json(
            { "success": false, "message": "Server Error" }
        )

    }
}

// Login COntroller
exports.loginUser = async (req, res) => {
    console.log("Login Body:", req.body);
    const { email, password, username, captchaToken } = req.body

    // 1. Verify Captcha
    if (!captchaToken) {
        console.log("Captcha token missing in login");
        return res.status(400).json({ success: false, message: "Captcha token is missing" });
    }

    try {
        const googleVerifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captchaToken}`;
        const response = await axios.post(googleVerifyUrl);
        if (!response.data.success) {
            console.log("Captcha verification failed in login:", response.data);
            return res.status(400).json({ success: false, message: "Captcha verification failed" });
        }
    } catch (error) {
        console.error("Captcha Error in login:", error);
        return res.status(500).json({ success: false, message: "Captcha verification server error" });
    }

    if (!password || (!email && !username)) {
        console.log("Missing fields in login:", { email, username, hasPassword: !!password });
        return res.status(400).json(
            {
                "success": false,
                "message": "Missing field"
            }
        )
    }
    try {
        const getUser = await User.findOne(
            {
                $or: [{ "email": email }, { "username": username }]
            }
        )

        if (!getUser) {
            console.log("User not found:", email || username);
            await logActivity({
                action: "LOGIN_FAILURE",
                status: "FAILURE",
                details: `Login attempt for non-existent user: ${email || username}`,
                req: req
            });
            return res.status(400).json(
                { "success": false, "message": "Invalid email/username or password" }
            )
        }

        // Check if account is locked
        if (getUser.lockUntil) {
            if (getUser.lockUntil > Date.now()) {
                const remainingLockTime = Math.ceil((getUser.lockUntil - Date.now()) / (60 * 1000));

                await logActivity({
                    userId: getUser._id,
                    username: getUser.username,
                    action: "LOGIN_FAILURE",
                    status: "WARNING",
                    details: `Login attempt while account locked. Remaining: ${remainingLockTime} mins.`,
                    req: req
                });

                return res.status(403).json({
                    success: false,
                    message: `Account is locked for ${remainingLockTime} more minutes.`,
                    isLocked: true,
                    lockUntil: getUser.lockUntil
                });
            } else {
                // Lock expired, reset attempts
                getUser.loginAttempts = 0;
                getUser.lockUntil = undefined;
                await getUser.save();
            }
        }

        const passwordCheck = await bcrypt.compare(password, getUser.password)
        if (!passwordCheck) {
            console.log("Invalid password for user:", getUser.username);

            // Increment login attempts
            getUser.loginAttempts += 1;
            let message = "Invalid email/username or password";

            if (getUser.loginAttempts >= 5) {
                getUser.lockUntil = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
                message = "Too many failed attempts. Account locked for 10 minutes.";

                await logActivity({
                    userId: getUser._id,
                    username: getUser.username,
                    action: "ACCOUNT_LOCKOUT",
                    status: "FAILURE",
                    details: "Account locked due to 5 failed login attempts.",
                    req: req
                });
            } else {
                await logActivity({
                    userId: getUser._id,
                    username: getUser.username,
                    action: "LOGIN_FAILURE",
                    status: "FAILURE",
                    details: `Invalid password attempt. Attempt ${getUser.loginAttempts}/5`,
                    req: req
                });
            }

            await getUser.save();

            return res.status(400).json({
                success: false,
                message: message,
                attemptsRemaining: Math.max(0, 5 - getUser.loginAttempts),
                isLocked: getUser.loginAttempts >= 5
            });
        }

        // Reset login attempts on successful login
        getUser.loginAttempts = 0;
        getUser.lockUntil = undefined;
        await getUser.save();

        await logActivity({
            userId: getUser._id,
            username: getUser.username,
            action: "LOGIN_SUCCESS",
            status: "SUCCESS",
            details: "User logged in successfully.",
            req: req
        });

        // 2. Check 2FA
        if (getUser.isTwoFactorEnabled) {
            console.log("2FA required for user:", getUser.username);
            const tempToken = jwt.sign(
                { id: getUser._id, role: '2fa_pending' },
                process.env.SECRET,
                { expiresIn: "5m" }
            );
            return res.status(200).json({
                success: true,
                require2FA: true,
                message: "2FA Verification Required",
                tempToken: tempToken
            });
        }

        const payload = {
            "_id": getUser._id,
            "email": getUser.email,
            "username": getUser.username,
            "name": getUser.name
        }

        const token = jwt.sign(payload, process.env.SECRET, { expiresIn: "7d" })
        console.log("Login successful for user:", getUser.username);
        return res.status(200).json(
            {
                "success": true,
                "message": "Login Successful",
                "data": getUser,
                "token": token
            }
        )

    } catch (error) {
        console.log("Login Execution Error:", error);
        return res.status(500).json(
            { "success": false, "message": "Server error" }
        )
    }
}

const transporter = nodemailer.createTransport(
    {
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    }
)

exports.sendResetLink = async (req, res) => {
    const { email } = req.body
    try {
        const user = await User.findOne({ email })
        if (!user) return res.status(404).json({
            success: false,
            message: "User not"
        })
        const token = jwt.sign({ id: user._id }, process.env.SECRET, { expiresIn: "15m" })
        const resetUrl = process.env.CLIENT_URL + "/reset/password/" + token
        const mailOptions = {
            from: `"My App" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Reset your password",
            html: `<p>Reset your password.. ${resetUrl}</p>`
        }
        transporter.sendMail(mailOptions, async (err, info) => {
            if (err) {
                console.log(err);
                return res.status(403).json({
                    success: false,
                    message: "Failed"
                })
            }
            if (info) console.log(info);

            await logActivity({
                username: email,
                action: "ADMIN_ACTION", // Using ADMIN_ACTION or adding a new enum if needed, but for now generic
                status: "SUCCESS",
                details: `Password reset link sent to ${email}`,
                req: req
            });

            return res.status(200).json({
                success: true,
                message: "Success"
            })
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Server error"
        })
    }
}

exports.resetPassword = async (req, res) => {
    const { token } = req.params
    const { password } = req.body

    try {
        const decoded = jwt.verify(token, process.env.SECRET)
        const hased = await bcrypt.hash(password, 10)

        await User.findByIdAndUpdate(decoded.id, { password: hased })

        await logActivity({
            userId: decoded.id,
            action: "PASSWORD_CHANGE",
            status: "SUCCESS",
            details: "Password reset successfully via email link.",
            req: req
        });

        return res.status(200).json({ sucess: true, message: "Password updated" })
    } catch (error) {
        return res.status(500).json(
            { "success": false, "message": "Server error/Token invalid" }
        )
    }
}

// 2FA Setup
exports.setup2FA = async (req, res) => {
    try {
        const user = await User.findById(req.user.id || req.user._id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const secret = speakeasy.generateSecret({ name: `WorkDay (${user.username})` });
        user.twoFactorSecret = secret.base32;
        await user.save();

        qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
            if (err) return res.status(500).json({ success: false, message: "Error generating QR Code" });
            res.json({
                success: true,
                message: "Scan this QR code",
                secret: secret.base32,
                qrCode: data_url
            });
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}

// Verify 2FA Setup
exports.verify2FASetup = async (req, res) => {
    const { token } = req.body;
    try {
        const user = await User.findById(req.user.id || req.user._id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: token
        });

        if (verified) {
            user.isTwoFactorEnabled = true;
            await user.save();

            await logActivity({
                userId: user._id,
                username: user.username,
                action: "ADMIN_ACTION",
                status: "SUCCESS",
                details: "Two-Factor Authentication enabled.",
                req: req
            });

            return res.status(200).json({ success: true, message: "2FA Enabled Successfully" });
        } else {
            await logActivity({
                userId: user._id,
                username: user.username,
                action: "ADMIN_ACTION",
                status: "FAILURE",
                details: "2FA Setup verification failed (Invalid OTP).",
                req: req
            });

            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}

// Verify 2FA Login
exports.verify2FALogin = async (req, res) => {
    const { otp, tempToken } = req.body;
    if (!otp || !tempToken) return res.status(400).json({ success: false, message: "Missing fields" });

    try {
        const decoded = jwt.verify(tempToken, process.env.SECRET);
        if (decoded.role !== '2fa_pending') return res.status(401).json({ success: false, message: "Invalid Token" });

        const user = await User.findById(decoded.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: otp
        });

        if (verified) {
            const payload = {
                "_id": user._id,
                "email": user.email,
                "username": user.username,
                "name": user.name
            }
            const token = jwt.sign(payload, process.env.SECRET, { expiresIn: "7d" });

            await logActivity({
                userId: user._id,
                username: user.username,
                action: "LOGIN_SUCCESS",
                status: "SUCCESS",
                details: "2FA Login Successful.",
                req: req
            });

            return res.status(200).json({
                success: true,
                message: "Login Successful",
                data: user,
                token: token
            });
        } else {
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }
    } catch (error) {
        console.log(error);
        return res.status(401).json({ success: false, message: "Invalid or Expired Session" });
    }
}

// Google Login
exports.googleLogin = async (req, res) => {
    const { access_token } = req.body;
    if (!access_token) return res.status(400).json({ success: false, message: "Access token missing" });

    try {
        // Use axios to get user info from Google using access_token
        const googleRes = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`);
        const { email, name, sub, picture } = googleRes.data;

        let user = await User.findOne({ email });

        if (!user) {
            // Create user if not exists
            const randomPassword = Math.random().toString(36).slice(-10);
            const hashedPass = await bcrypt.hash(randomPassword, 10);

            user = new User({
                username: email.split('@')[0] + Math.floor(Math.random() * 1000),
                name,
                email,
                role: "worker", // Default to worker for Google login
                password: hashedPass,
                profilePic: picture,
                phone: "0000000000", // Placeholder, user should update later
                isVerified: false
            });
            await user.save();
        }

        const payload = {
            "_id": user._id,
            "email": user.email,
            "username": user.username,
            "name": user.name
        };

        const token = jwt.sign(payload, process.env.SECRET, { expiresIn: "7d" });

        await logActivity({
            userId: user._id,
            username: user.username,
            action: "LOGIN_SUCCESS",
            status: "SUCCESS",
            details: "Google OAuth Login successful.",
            req: req
        });

        return res.status(200).json({
            success: true,
            message: "Google Login Successful",
            data: user,
            token: token
        });

    } catch (error) {
        console.error("Google Login Error:", error);
        await logActivity({
            action: "LOGIN_FAILURE",
            status: "FAILURE",
            details: `Google OAuth verification failed: ${error.message}`,
            req: req
        });
        return res.status(500).json({ success: false, message: "Google verification failed" });
    }
}
// Facebook Login
exports.facebookLogin = async (req, res) => {
    const { accessToken } = req.body;
    if (!accessToken) return res.status(400).json({ success: false, message: "Access token missing" });

    try {
        // Use axios to get user info from Facebook Graph API
        const facebookUrl = `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`;
        const facebookRes = await axios.get(facebookUrl);
        const { email, name, picture } = facebookRes.data;

        // Note: Facebook might not provide email if not authorized or not set on account
        const userEmail = email || `${facebookRes.data.id}@facebook.com`;

        let user = await User.findOne({ email: userEmail });

        if (!user) {
            // Create user if not exists
            const randomPassword = Math.random().toString(36).slice(-10);
            const hashedPass = await bcrypt.hash(randomPassword, 10);

            user = new User({
                username: (name ? name.replace(/\s/g, '').toLowerCase() : 'fbuser') + Math.floor(Math.random() * 1000),
                name: name || "Facebook User",
                email: userEmail,
                role: "worker", // Default to worker
                password: hashedPass,
                profilePic: picture?.data?.url || "",
                phone: "0000000000",
                isVerified: false
            });
            await user.save();
        }

        const payload = {
            "_id": user._id,
            "email": user.email,
            "username": user.username,
            "name": user.name
        };

        const token = jwt.sign(payload, process.env.SECRET, { expiresIn: "7d" });

        await logActivity({
            userId: user._id,
            username: user.username,
            action: "LOGIN_SUCCESS",
            status: "SUCCESS",
            details: "Facebook OAuth Login successful.",
            req: req
        });

        return res.status(200).json({
            success: true,
            message: "Facebook Login Successful",
            data: user,
            token: token
        });

    } catch (error) {
        console.error("Facebook Login Error:", error.response?.data || error.message);
        await logActivity({
            action: "LOGIN_FAILURE",
            status: "FAILURE",
            details: `Facebook OAuth verification failed: ${error.message}`,
            req: req
        });
        return res.status(500).json({ success: false, message: "Facebook verification failed" });
    }
}

// Request OTP for Profile/Password Update
exports.requestUpdateOTP = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.updateOTP = otp;
        user.updateOTPExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        await user.save();

        const mailOptions = {
            from: `"WorkDay Security" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: "Security Code for Profile Update",
            html: `<p>Your 6-digit verification code is: <b>${otp}</b></p><p>This code will expire in 10 minutes.</p>`
        };

        transporter.sendMail(mailOptions, async (err, info) => {
            if (err) {
                console.error("Email Error:", err);
                return res.status(500).json({ success: false, message: "Failed to send email" });
            }
            await logActivity({
                userId: user._id,
                username: user.username,
                action: "SENSITIVE_UPDATE_OTP_REQUEST",
                status: "SUCCESS",
                details: "OTP requested for sensitive profile/password update.",
                req: req
            });

            res.status(200).json({ success: true, message: "Verification code sent to your email" });
        });
    } catch (error) {
        console.error("OTP Request Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Secure Password Update (Handles history check and OTP)
exports.secureUpdatePassword = async (req, res) => {
    const { newPassword, otp } = req.body;
    const userId = req.user?.id || req.user?._id;

    if (!newPassword || !otp) return res.status(400).json({ success: false, message: "Missing password or OTP" });

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        // 1. Verify OTP
        if (!user.updateOTP || user.updateOTP !== otp || user.updateOTPExpires < Date.now()) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
        }

        // 2. Check Password History (Current and Previous)
        const isCurrentMatch = await bcrypt.compare(newPassword, user.password);
        if (isCurrentMatch) {
            return res.status(400).json({ success: false, message: "New password cannot be the same as the current password" });
        }

        for (const historyHash of user.passwordHistory) {
            const isMatch = await bcrypt.compare(newPassword, historyHash);
            if (isMatch) {
                return res.status(400).json({ success: false, message: "New password cannot be one of your last 2 passwords" });
            }
        }

        // 3. Update Password and History
        const hashedPass = await bcrypt.hash(newPassword, 10);

        // Update history: keep only the last password hash
        user.passwordHistory = [user.password];
        user.password = hashedPass;

        // Clear OTP
        user.updateOTP = undefined;
        user.updateOTPExpires = undefined;

        await user.save();

        await logActivity({
            userId: user._id,
            username: user.username,
            action: "PASSWORD_CHANGE",
            status: "SUCCESS",
            details: "Password updated successfully using secure OTP flow.",
            req: req
        });

        res.status(200).json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        console.error("Secure Password Update Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}
