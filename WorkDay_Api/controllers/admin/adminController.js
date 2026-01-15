const User = require("../../models/User");
const bcrypt = require("bcrypt");
const { logActivity } = require("../../utils/auditLogger");

exports.getAdminProfile = async (req, res) => {
    try {
        const admin = await User.findById(req.user._id)
            .select("-password");

        if (!admin || admin.role !== "admin") {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Successfully fetched admin profile",
            data: admin,
        });
    } catch (err) {
        console.error("Error getting admin profile:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.updateAdminProfile = async (req, res) => {
    try {
        const allowedUpdates = ["name", "otp"];
        const updates = {};

        for (let key of allowedUpdates) {
            if (req.body[key] !== undefined) {
                updates[key] = req.body[key];
            }
        }

        // Fix here: Use req.file, not req.files
        if (req.file) {
            updates.profilePic = req.file.path;
        }

        // OTP Verification
        const user = await User.findById(req.user._id);
        if (!updates.otp || user.updateOTP !== updates.otp || user.updateOTPExpires < Date.now()) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP. Please request a new one." });
        }

        // Clear OTP
        updates.updateOTP = undefined;
        updates.updateOTPExpires = undefined;
        delete updates.otp;

        const updatedAdmin = await User.findByIdAndUpdate(req.user._id, updates, {
            new: true,
            runValidators: true,
            context: "query",
        }).select("-password");

        if (!updatedAdmin || updatedAdmin.role !== "admin") {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }

        await logActivity({
            userId: req.user._id,
            username: req.user.username,
            action: "ADMIN_PROFILE_UPDATE",
            status: "SUCCESS",
            details: "Admin profile updated successfully.",
            req: req
        });

        return res.status(200).json({
            success: true,
            message: "Admin profile updated successfully",
            data: updatedAdmin,
        });
    } catch (err) {
        console.error("Error updating admin profile:", err);
        return res.status(500).json({ message: "Server error" });
    }
};

exports.changeAdminPassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, otp } = req.body;

        const admin = await User.findById(req.user._id);

        if (!admin || admin.role !== "admin") {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }

        // 1. Verify OTP
        if (!otp || admin.updateOTP !== otp || admin.updateOTPExpires < Date.now()) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
        }

        // 2. Check current password
        const isMatch = await bcrypt.compare(currentPassword, admin.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Incorrect current password" });
        }

        // 3. Check password history (Last 2: Current and Previous)
        const isSameAsCurrent = await bcrypt.compare(newPassword, admin.password);
        if (isSameAsCurrent) {
            return res.status(400).json({ success: false, message: "New password cannot be the same as the current password" });
        }

        for (const historyHash of admin.passwordHistory) {
            const isMatchHistory = await bcrypt.compare(newPassword, historyHash);
            if (isMatchHistory) {
                return res.status(400).json({ success: false, message: "New password cannot be one of your last 2 passwords" });
            }
        }

        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);

        admin.passwordHistory = [admin.password];
        admin.password = hashedNewPassword;

        // Clear OTP
        admin.updateOTP = undefined;
        admin.updateOTPExpires = undefined;

        await admin.save();

        await logActivity({
            userId: req.user._id,
            username: req.user.username,
            action: "PASSWORD_CHANGE",
            status: "SUCCESS",
            details: "Admin password changed successfully.",
            req: req
        });

        res.status(200).json({ success: true, message: "Password updated successfully" });
    } catch (err) {
        console.error("Error changing admin password:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};
