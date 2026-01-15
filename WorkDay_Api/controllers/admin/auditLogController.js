const AuditLog = require("../../models/AuditLog");

/**
 * Get all audit logs (Admin only)
 */
const getAuditLogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const { search, action, status, startDate, endDate } = req.query;

        let query = {};

        if (search) {
            query.$or = [
                { username: { $regex: search, $options: "i" } },
                { details: { $regex: search, $options: "i" } }
            ];
        }

        if (action) query.action = action;
        if (status) query.status = status;

        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = new Date(startDate);
            if (endDate) query.timestamp.$lte = new Date(endDate);
        }

        const logs = await AuditLog.find(query)
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit)
            .populate("user", "username email role");

        const totalItems = await AuditLog.countDocuments(query);

        res.status(200).json({
            success: true,
            data: logs,
            pagination: {
                totalItems,
                currentPage: page,
                totalPages: Math.ceil(totalItems / limit)
            }
        });
    } catch (error) {
        console.error("Fetch Audit Logs Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

module.exports = { getAuditLogs };
