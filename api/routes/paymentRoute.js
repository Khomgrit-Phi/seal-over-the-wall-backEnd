import express from "express";
import { Payment } from "../../models/Payment.js";
import { Order } from "../../models/Order.js";
import bcrypt from "bcrypt";

const router = express.Router();

// Create new payment document
router.post("/", async (req, res) => {
    const { orderId, amount, method, status, cardName, cardNumber, cvv, paymentData } = req.body;
    console.log(req.body);
    if ( !orderId || !amount || !method || !status || !cardName || !cardNumber || !cvv || !paymentData ) {
        return res.status(400).json({
            error: true,
            message: "All fields are required"
        });
    }
    try {
        const existingOrder = await Order.findOne({orderId});
        if(existingOrder) {
            res.status(404).json({
                error: true,
                message : "No Order found"
            });
        }
        const payment = new Payment({ orderId, amount, method, status, cardName, cardNumber, cvv, paymentData});

        await payment.save();
        res.status(201).json({
            error : false,
            message : "Payment register succesful"
        })
    } catch (err) {
        return res.status(500).json({
            error: true,
            message: "Sever error"
        })
    }
});

export default router;