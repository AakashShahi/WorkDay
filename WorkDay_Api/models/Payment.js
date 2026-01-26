const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        pidx: {
            type: String,
            required: true,
            unique: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ["Pending", "Completed", "Expired", "User canceled", "Failed", "Initiated"],
            default: "Initiated",
        },
        purchase_order_id: {
            type: String,
            required: true,
        },
        purchase_order_name: {
            type: String,
            required: true,
        },
        transaction_id: {
            type: String,
        },
        payment_url: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Payment", PaymentSchema);
