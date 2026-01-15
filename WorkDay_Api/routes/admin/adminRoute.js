const express = require("express");
const router = express.Router();
const authenticateUser = require("../../middlewares/authorizedUser");
const adminController = require("../../controllers/admin/adminController");
const upload = require("../../middlewares/fileUpload")
const { getAuditLogs } = require("../../controllers/admin/auditLogController");

// Get admin profile
router.get(
    "/",
    authenticateUser.authenticateUser,
    authenticateUser.isAdmin,
    adminController.getAdminProfile
);

// Update admin profile (name, profile picture)
router.put(
    "/update",
    upload.single("profile_pic"),
    authenticateUser.authenticateUser,
    authenticateUser.isAdmin,
    adminController.updateAdminProfile
);

// Change admin password
router.put(
    "/password",
    authenticateUser.authenticateUser,
    authenticateUser.isAdmin,
    adminController.changeAdminPassword
);

// Get audit logs
router.get(
    "/audit-logs",
    authenticateUser.authenticateUser,
    authenticateUser.isAdmin,
    getAuditLogs
);

module.exports = router;
