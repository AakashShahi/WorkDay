const User = require("../models/User")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const nodemailer = require("nodemailer")
const speakeasy = require("speakeasy")
const qrcode = require("qrcode")
const axios = require("axios")

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
            return res.status(400).json({ success: false, message: "Captcha verification failed" });
        }
    } catch (error) {
        console.error("Captcha Error in registration:", error);
        return res.status(500).json({ success: false, message: "Captcha verification server error" });
    }

    try {
        const existingUser = await User.findOne(
            {
                $or: [{ username: username }, { email: email }]
            }
        )

        if (existingUser) {
            console.log("User already exists:", username, email);
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
            return res.status(400).json(
                { "success": false, "message": "User not found" }
            )
        }

        const passwordCheck = await bcrypt.compare(password, getUser.password)
        if (!passwordCheck) {
            console.log("Invalid password for user:", getUser.username);
            return res.status(400).json(
                { "success": false, "message": "Invalid Credentials" }
            )
        }

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
            "name": getUser.name,
            "role": getUser.role
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
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.log(err);
                return res.status(403).json({
                    success: false,
                    message: "Failed"
                })
            }
            if (info) console.log(info);
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
            return res.status(200).json({ success: true, message: "2FA Enabled Successfully" });
        } else {
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
                "name": user.name,
                "role": user.role
            }
            const token = jwt.sign(payload, process.env.SECRET, { expiresIn: "7d" });
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
            "name": user.name,
            "role": user.role
        };

        const token = jwt.sign(payload, process.env.SECRET, { expiresIn: "7d" });

        return res.status(200).json({
            success: true,
            message: "Google Login Successful",
            data: user,
            token: token
        });

    } catch (error) {
        console.error("Google Login Error:", error);
        return res.status(500).json({ success: false, message: "Google verification failed" });
    }
}
