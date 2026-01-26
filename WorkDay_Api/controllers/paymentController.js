const axios = require("axios");
const Payment = require("../models/Payment");
const User = require("../models/User");
const { logActivity } = require("../utils/auditLogger");

const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY || "key 05bf95cc57244045b8df5fad06748dab"; // Fallback to test key if not set
const KHALTI_INITIATE_URL = "https://dev.khalti.com/api/v2/epayment/initiate/";
const KHALTI_LOOKUP_URL = "https://dev.khalti.com/api/v2/epayment/lookup/";

exports.initializePayment = async (req, res) => {
    try {
        const { amount, purchase_order_id, purchase_order_name } = req.body;
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const payload = {
            return_url: `${process.env.CLIENT_URL || "http://localhost:5173"}/payment-status`,
            website_url: process.env.CLIENT_URL || "http://localhost:5173",
            amount: amount, // in paisa
            purchase_order_id: purchase_order_id,
            purchase_order_name: purchase_order_name,
            customer_info: {
                name: user.name || user.username,
                email: user.email,
                phone: user.phone,
            },
        };

        const response = await axios.post(KHALTI_INITIATE_URL, payload, {
            headers: {
                Authorization: `Key ${KHALTI_SECRET_KEY.replace("Key ", "").replace("key ", "")}`,
                "Content-Type": "application/json",
            },
        });

        const { pidx, payment_url } = response.data;

        const newPayment = new Payment({
            userId,
            pidx,
            amount,
            purchase_order_id,
            purchase_order_name,
            payment_url,
            status: "Initiated",
        });

        await newPayment.save();

        res.status(200).json({
            success: true,
            data: response.data,
        });
    } catch (err) {
        console.error("Khalti Initiate Error:", err.response?.data || err.message);
        res.status(500).json({
            success: false,
            message: "Failed to initialize payment",
            error: err.response?.data || err.message,
        });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        const { pidx } = req.query;

        if (!pidx) {
            return res.status(400).json({ success: false, message: "pidx is required" });
        }

        const response = await axios.post(
            KHALTI_LOOKUP_URL,
            { pidx },
            {
                headers: {
                    Authorization: `Key ${KHALTI_SECRET_KEY.replace("Key ", "").replace("key ", "")}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const paymentData = response.data;
        const payment = await Payment.findOne({ pidx });

        if (!payment) {
            return res.status(404).json({ success: false, message: "Payment record not found" });
        }

        payment.status = paymentData.status;
        payment.transaction_id = paymentData.transaction_id;
        await payment.save();

        if (paymentData.status === "Completed") {
            const user = await User.findById(payment.userId);
            if (user) {
                user.verificationRequest = true;
                await user.save();
                
                await logActivity({
                    userId: user._id,
                    username: user.username,
                    action: "VERIFICATION_PAYMENT_SUCCESS",
                    status: "SUCCESS",
                    details: `Worker paid 100 NPR for verification. pidx: ${pidx}`,
                    req: req
                });
            }
        }

        res.status(200).json({
            success: true,
            message: "Payment verified successfully",
            data: paymentData,
        });
    } catch (err) {
        console.error("Khalti Verification Error:", err.response?.data || err.message);
        res.status(500).json({
            success: false,
            message: "Failed to verify payment",
            error: err.response?.data || err.message,
        });
    }
};
