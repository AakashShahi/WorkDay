const express = require("express")
const router = express.Router()
const { authenticateUser } = require("../middlewares/authorizedUser")
const userController = require("../controllers/userController")
const upload = require("../middlewares/fileUpload")

//route for register
router.post(
    "/register",
    upload.single("profile_pic"),
    userController.regiterUser
)

//route for login
router.post(
    "/login",
    userController.loginUser
)

router.post("/verify-2fa-login", userController.verify2FALogin)
router.post("/setup-2fa", authenticateUser, userController.setup2FA)
router.post("/verify-2fa-setup", authenticateUser, userController.verify2FASetup)

router.post(
    "/request-reset",
    userController.sendResetLink
)

router.post(
    "/reset-password/:token",
    userController.resetPassword
)

router.post("/google", userController.googleLogin)
router.post("/facebook", userController.facebookLogin)

module.exports = router