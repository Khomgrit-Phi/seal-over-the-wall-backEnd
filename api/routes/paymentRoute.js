import express from "express";
import { Payment } from "../../models/Payment.js";
import bcrypt from "bcrypt";

const router = express.Router();

// Create new payment document
router.post("/auth/Payment", async (req, res) => {
    const { amount, method, status, cardName, cardNumber, cvv, paymentData } = req.body;
    if ( !amount || !method || !status || !cardName || !cardNumber || !cvv || !paymentData ) {
        return res.status(400).json({
            error: true,
            message: "All fields are required"
        });
    }
    try {
        const existingPayment = await User.findOne({cardNumber});
        if(existingPayment) {
            res.status(409).json({
                error: true,
                message : "Card is already in use"
            });
        }
        const payment = new Payment({fullName, email, password});

        await user.save();
        res.status(201).json({
            error : false,
            message : "User register succesful"
        })
    } catch {}
});