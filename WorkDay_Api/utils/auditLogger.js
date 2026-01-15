const AuditLog = require("../models/AuditLog");

/**
 * Log a system activity
 * @param {Object} params
 * @param {string} params.userId - The ID of the user performing the action (optional)
 * @param {string} params.username - The username (optional)
 * @param {string} params.action - The action name (from enum)
 * @param {string} params.status - SUCCESS, FAILURE, or WARNING
 * @param {string} params.details - Detailed message
 * @param {Object} params.req - Express request object to extract IP and User-Agent
 */
const logActivity = async ({ userId, username, action, status, details, req }) => {
    try {
        const logEntry = new AuditLog({
            user: userId,
            username: username,
            action: action,
            status: status,
            details: details,
            ipAddress: req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress) : 'SYSTEM',
            userAgent: req ? req.headers['user-agent'] : 'SYSTEM'
        });
        await logEntry.save();
    } catch (error) {
        console.error("Failed to save audit log:", error);
    }
};

module.exports = { logActivity };
