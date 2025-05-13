import express from "express";
import { Order, OrderItem } from "../../models/Order.js";
import { Cart } from "../../models/Cart.js";
import mongoose from "mongoose";

const router = express.Router();

//Create an order
router.post("/", async (req, res) => {
    const { userId, items = [], status = 'pending', total, vat = 7, addressId = '', paymentId = '' } = req.body;

    if (!userId || !status || !vat || !total) {
        return res.status(400).json({ error: true, message: "The information is not fulfilled" });
    }

    try {
        // Step 1: Create the Order object (without items)
        const order = new Order({
            userId: new mongoose.Types.ObjectId(userId),
            items: [], // Initially empty
            status,
            total,
            vat,
            addressId: addressId ? new mongoose.Types.ObjectId(addressId) : undefined,
            paymentId: paymentId ? new mongoose.Types.ObjectId(paymentId) : undefined,
        });

        // Step 2: Save the order to get the _id
        await order.save();

        // Step 3: Attach the orderId to each item
        order.items = items.map(item => ({
            orderId: order._id,  // Attach the order ID
            productId: new mongoose.Types.ObjectId(item.productId),
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            selectedSize: item.selectedSize,
            selectedColor: item.selectedColor,
            selectedImage: item.selectedImage,
        }));

        // Step 4: Save the updated order with items
        await order.save();

        return res.status(201).json({ error: false, order, message: "The order is created successfully" });

    } catch (err) {
        return res.status(500).json({ error: true, message: "Server error", details: err.message });
    }
});

// //Create partial order (no address and payment) Initiate this first
// router.post("/:userId", async (req, res) => {
//     const { userId, status = "pending", vat = 7 } = req.body;

//     if (!userId || !status) {
//         return res.status(400).json({ error: true, message: "The information is not fulfilled" });
//     }

//     try {
//         // Fetch cart items for the user
//         const cart = await Cart.findOne({ userId });
//         if (!cart || cart.items.length === 0) {
//             return res.status(400).json({ error: true, message: "Cart is empty" });
//         }

//         // Calculate total from cart items
//         const total = cart.items.reduce((acc, item) => acc + item.totalPrice, 0);

//         // Create the order without addressId and paymentId
//         const order = new Order({
//             userId: new mongoose.Types.ObjectId(userId),
//             items: cart.items,
//             status,
//             total,
//             vat,
//         });

//         await order.save();

//         // Clear the cart after creating the order
//         await Cart.findOneAndUpdate(
//             { userId: new mongoose.Types.ObjectId(userId) },
//             { items: [], total: 0 }
//         );

//         return res.status(201).json({ error: false, order, message: "Order created successfully (pending details)" });

//     } catch (err) {
//         return res.status(500).json({ error: true, message: "Server error", details: err.message });
//     }
// });

//Get an order by order object ID


router.get("/:orderId", async (req,res) => {
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

//Update order status ('pending', 'paid', 'shipped', 'delivered', 'cancelled')
router.patch("/:orderId", async (req, res) => {
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

//Update order addressId and paymentId Update this after create a partial order
router.patch("/:orderId", async (req, res) => {
    const { orderId } = req.params;
    const { addressId, paymentId } = req.body;

    if (!addressId || !paymentId) {
        return res.status(400).json({ error: true, message: "Address and payment info required" });
    }

    try {
        // Update the existing order with address and payment
        const updatedOrder = await Order.findByIdAndUpdate(orderId, {
            addressId: new mongoose.Types.ObjectId(addressId),
            paymentId: new mongoose.Types.ObjectId(paymentId),
            status: "awaiting payment",
        }, { new: true });

        if (!updatedOrder) {
            return res.status(404).json({ error: true, message: "Order not found" });
        }

        return res.status(200).json({ error: false, order: updatedOrder, message: "Order updated with address and payment" });

    } catch (err) {
        return res.status(500).json({ error: true, message: "Server error", details: err.message });
    }
});

//Create an order-item and update order total price
router.post("/orderItem", async (req, res) => {
    const { orderId, productId, quantity, unitPrice, selectedSize, selectedColor } = req.body;

    // Check required fields
    if (!orderId, !productId || !quantity || !unitPrice || !selectedSize || !selectedColor) {
        return res.status(400).json({ error: true, message: "The information is not fulfilled" });
    }

    try {
        // Create and save the order item
        const orderItem = new OrderItem({ orderId, productId, quantity, unitPrice, selectedSize, selectedColor });
        await orderItem.save();

        //Calculate the order item total & Update the order's total with the new item's total price
        const itemTotal = quantity * unitPrice;
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { $inc: { total: itemTotal } },  // Increment the total
            { new: true }                    // Return the updated document
        );

        return res.status(201).json({ error: false, orderItem, updatedOrder, message: "Order item created and total updated successfully" });

    } catch (err) {
        return res.status(500).json({ error: true, message: "Server error", details: err.message });
    }
});


//Update order when order-item is added


//////////////////////////////////////////////////////////////////////////////////////////////////////

//Maybe for cart route




export default router