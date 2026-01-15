const User = require("../../models/User");
const bcrypt = require("bcrypt");
const { logActivity } = require("../../utils/auditLogger");


exports.getLoggedInUser = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId).populate("profession");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "User fetched successfully",
            data: user,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: err.message,
        });
    }
};

exports.updateLoggedInUser = async (req, res) => {
    try {
        const { name, password, otp } = req.body;
        const userId = req.user._id;
        const user = await User.findById(userId);

        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        // OTP Verification
        if (!otp || user.updateOTP !== otp || user.updateOTPExpires < Date.now()) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP. Please request a new one." });
        }

        const updates = {};
        if (name) updates.name = name;
        if (req.file?.path) updates.profilePic = req.file.path;

        if (password) {
            // Password History check
            const isSameAsCurrent = await bcrypt.compare(password, user.password);
            if (isSameAsCurrent) {
                return res.status(400).json({ success: false, message: "New password cannot be the same as the current password" });
            }

            for (const historyHash of user.passwordHistory) {
                const isMatchHistory = await bcrypt.compare(password, historyHash);
                if (isMatchHistory) {
                    return res.status(400).json({ success: false, message: "New password cannot be one of your last 2 passwords" });
                }
            }

            updates.passwordHistory = [user.password];
            updates.password = await bcrypt.hash(password, 10);
        }

        // Always clear OTP on update
        updates.updateOTP = undefined;
        updates.updateOTPExpires = undefined;

        const updatedUser = await User.findByIdAndUpdate(userId, updates, {
            new: true,
            runValidators: true,
        }).populate("profession");

        await logActivity({
            userId: userId,
            username: updatedUser.username,
            action: "PROFILE_UPDATE",
            status: "SUCCESS",
            details: `Customer profile updated successfully. ${password ? "Password also changed." : ""}`,
            req: req
        });

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: updatedUser,
        });

    } catch (err) {
        console.error("Update Error:", err);
        res.status(500).json({
            success: false,
            message: "Failed to update user",
            error: err.message,
        });
    }
};
