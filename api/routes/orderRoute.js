import express from "express";
import { Order, OrderItem } from "../../models/Order";

const router = express.Router();


router.post("/order", async (req, res) => {
    const {userId, addressId, items, status, total, vat, paymentId, } = req.body;
    if (!userId || !addressId || !items || !status || !total || !vat || !paymentId) {
        return res.status(400).json({error: true, message: "The information is not fulfilled"
        })
    }

    try {
        const order = new Order ({userId, addressId, items, status, total, vat, paymentId});
        await order.save()
        return res.status(201).json({ error: false, order, message: "The order is create successfully" });

    } catch (err) {
        return res.status(500).json({error: true, message: "Server error", details: err.message })
    }
})

router.get("/order/:orderId", async (req,res) => {
    const {orderId} = req.params;
    if (!orderId) {
        return res.status(400).json({error: true,message: "The information is not fulfilled"})
    }

    try{
    const existOrder = await Order.findById(orderId )
    if (!existOrder) {
        return res.status(404).json({error: true,message: "Order not found"})
    }
        return res.status(200).json({ error: false, existOrder, message: "Order detailed retreived"});

    } catch(err){
        return res.status(500).json({error: true, message: "Server error", details: err.message })
    }
})

router.patch("/order/:orderId", async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!orderId || !status) {
        return res.status(400).json({ error: true, message: "The information is not fulfilled" });
    }

    try {
        const updatedOrder = await Order.findByIdAndUpdate(orderId, { status }, { new: true });

        if (!updatedOrder) {
            return res.status(404).json({ error: true, message: "Order not found" });
        }

        return res.status(200).json({ error: false, order: updatedOrder, message: "Order status updated" });

    } catch (err) {
        return res.status(500).json({ error: true, message: "Server error", details: err.message });
    }
});

router.post("/order/orderItem", async (req, res) => {
    const {productId, quantity,unitPrice,selectedSize,selectedColor} = req.body;
    if (!productId || !quantity || !unitPrice || !selectedSize || !selectedColor) {
        return res.status(400).json({error: true, message: "The information is not fulfilled"})
    }

    try {
        const orderItem = new OrderItem ({productId ,quantity ,unitPrice ,selectedSize ,selectedColor})
        await OrderItem.save(orderItem)
        return res.status(200).json({ error:false, orderItem, message: "Order item is create" })

    } catch (err) {
        return res.status(500).json({error: true, message: "Server error", details: err.message })
    }

    }
)

router.post("/order/orderItem", async (req, res) => {
    const { productId, quantity, unitPrice, selectedSize, selectedColor } = req.body;

    // Check required fields
    if (!productId || !quantity || !unitPrice || !selectedSize || !selectedColor) {
        return res.status(400).json({ error: true, message: "The information is not fulfilled" });
    }

    try {
        // Create and save the order item
        const orderItem = new OrderItem({ productId, quantity, unitPrice, selectedSize, selectedColor });
        await orderItem.save();
        return res.status(201).json({ error: false, orderItem, message: "Order item created" });

    } catch (err) {
        return res.status(500).json({ error: true, message: "Server error", details: err.message });
    }
});