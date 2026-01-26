const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { authenticateUser } = require("../middlewares/authorizedUser");

router.post("/initiate", authenticateUser, paymentController.initializePayment);
router.get("/verify", authenticateUser, paymentController.verifyPayment);

module.exports = router;
