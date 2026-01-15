const User = require("../../models/User")
const bcrypt = require("bcrypt")
const { logActivity } = require("../../utils/auditLogger");

exports.getWorkerProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select("-password")
            .populate('profession');

        if (!user || user.role !== "worker") {
            return res.status(404).json({ message: "Worker not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Successfully fetched worker",
            data: user
        });
    } catch (err) {
        console.error("Error getting worker profile:", err);
        return res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
};

exports.updateWorkerProfile = async (req, res) => {
    try {
        const allowedUpdates = [
            "name",
            "skills",
            "location",
            "availability",
            "certificateUrl", // optional
            "phone",
            "profession",
            "otp",
        ];

        const updates = {};

        // Parse and apply each allowed update
        for (let key of allowedUpdates) {
            if (req.body[key] !== undefined) {
                if (key === "skills") {
                    try {
                        const parsedSkills = JSON.parse(req.body.skills);
                        updates.skills = Array.isArray(parsedSkills)
                            ? parsedSkills.filter(
                                (skill) =>
                                    typeof skill === "string" &&
                                    skill.trim().length > 0
                            )
                            : [];
                    } catch (err) {
                        console.warn("Invalid skills format:", req.body.skills);
                        updates.skills = [];
                    }
                } else {
                    updates[key] = req.body[key];
                }
            }
        }

        // Handle uploaded files (profile_pic and certificate)
        if (req.files) {
            if (req.files["profile_pic"] && req.files["profile_pic"][0]) {
                updates.profilePic = req.files["profile_pic"][0].path;
            }
            if (req.files["certificate"] && req.files["certificate"][0]) {
                updates.certificateUrl = req.files["certificate"][0].path;
            }
        }

        // OTP Verification
        const user = await User.findById(req.user.id);
        if (!updates.otp || user.updateOTP !== updates.otp || user.updateOTPExpires < Date.now()) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP. Please request a new one." });
        }

        // Clear OTP after successful validation (but before save to avoid reuse if save fails later, 
        // actually better to clear at the very end or just before findByIdAndUpdate)
        updates.updateOTP = undefined;
        updates.updateOTPExpires = undefined;
        delete updates.otp; // Don't save 'otp' field to DB

        const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, {
            new: true,
            runValidators: true,
            context: "query",
        }).select("-password");

        if (!updatedUser || updatedUser.role !== "worker") {
            return res.status(404).json({ message: "Worker not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Worker details updated",
            data: updatedUser,
        });
    } catch (err) {
        console.error("Error updating worker profile:", err);
        return res.status(500).json({ message: "Server error" });
    }
};

exports.changeWorkerPassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, otp } = req.body;

        const user = await User.findById(req.user.id);
        if (!user || user.role !== "worker") {
            return res.status(404).json({ success: false, message: "Worker not found" });
        }

        // 1. Verify OTP
        if (!otp || user.updateOTP !== otp || user.updateOTPExpires < Date.now()) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
        }

        // 2. Check current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Incorrect current password" });
        }

        // 3. Check password history (Last 2: Current and Previous)
        const isSameAsCurrent = await bcrypt.compare(newPassword, user.password);
        if (isSameAsCurrent) {
            return res.status(400).json({ success: false, message: "New password cannot be the same as the current password" });
        }

        for (const historyHash of user.passwordHistory) {
            const isMatchHistory = await bcrypt.compare(newPassword, historyHash);
            if (isMatchHistory) {
                return res.status(400).json({ success: false, message: "New password cannot be one of your last 2 passwords" });
            }
        }

        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);

        // Update history: keep only last (previous) password
        user.passwordHistory = [user.password];
        user.password = hashedNewPassword;

        // Clear OTP
        user.updateOTP = undefined;
        user.updateOTPExpires = undefined;

        await user.save();

        await logActivity({
            userId: req.user._id,
            username: req.user.username,
            action: "PASSWORD_CHANGE",
            status: "SUCCESS",
            details: "Worker password changed successfully.",
            req: req
        });

        return res.status(200).json({ success: true, message: "Password updated successfully" });
    } catch (err) {
        console.error("Error changing password:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.applyForVerification = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user || user.role !== "worker") {
            return res.status(404).json({ success: false, message: "Worker not found" });
        }

        if (!user.certificateUrl || user.certificateUrl.trim() === "") {
            return res.status(400).json({ success: false, message: "You must upload a certificate before applying for verification." });
        }

        if (user.verificationRequest) {
            return res.status(400).json({ success: false, message: "You have already applied for verification." });
        }

        user.verificationRequest = true;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Verification request submitted successfully.",
        });
    } catch (err) {
        console.error("Error applying for verification:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.cancelVerificationRequest = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user || user.role !== "worker") {
            return res.status(404).json({ success: false, message: "Worker not found" });
        }

        if (!user.verificationRequest) {
            return res.status(400).json({ success: false, message: "You have not applied for verification." });
        }

        user.verificationRequest = false;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Verification request has been cancelled.",
        });
    } catch (err) {
        console.error("Error cancelling verification:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

