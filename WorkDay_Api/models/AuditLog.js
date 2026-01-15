const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false // Can be null for failed login attempts with non-existent users
    },
    username: String, // Direct lookup helper
    action: {
        type: String,
        required: true,
        enum: [
            "LOGIN_SUCCESS",
            "LOGIN_FAILURE",
            "LOGOUT",
            "ACCOUNT_LOCKOUT",
            "PASSWORD_CHANGE",
            "PROFILE_UPDATE",
            "REGISTRATION",
            "ADMIN_ACTION",
            "SENSITIVE_UPDATE_OTP_REQUEST"
        ]
    },
    status: {
        type: String,
        enum: ["SUCCESS", "FAILURE", "WARNING"],
        default: "SUCCESS"
    },
    details: {
        type: String
    },
    ipAddress: String,
    userAgent: String,
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("AuditLog", auditLogSchema);
