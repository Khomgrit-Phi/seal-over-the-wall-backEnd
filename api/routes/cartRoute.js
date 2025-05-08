import express from "express";
import { Cart, CartItem } from "../../models/Cart.js";
import mongoose from "mongoose";

const router = express.Router();

//Create a cart
router.post("/", async (req, res) => {
    const {sessionId ,userId, items =[], status, total=0, vat=7,  } = req.body;
    if (!userId || !status) {
        return res.status(400).json({error: true, message: "The information is not fulfilled"
        })
    }

    try {
        const cart = new Cart({
            userId: new mongoose.Types.ObjectId(userId),
            items: items?.map(item => ({
                ...item,
                productId: new mongoose.Types.ObjectId(item.productId),
                selectedSize: item.selectedSize,
                selectedColor: item.selectedColor,
            })) || [], // Handle case where items might be undefined
            status,
            total,
            vat,
        });
        await cart.save()

        return res.status(201).json({ error: false, Cart, message: "The cart is create successfully" });

    } catch (err) {
        return res.status(500).json({error: true, message: "Server error", details: err.message })
    }
})

//Get a cart
router.get("/:cartId", async (req,res) => {
    const {cartId} = req.params;
    if (!cartId) {
        return res.status(400).json({error: true,message: "The information is not fulfilled"})
    }

    try{
    const existCart = await Cart.findById(cartId )
    if (!existCart) {
        return res.status(404).json({error: true,message: "Cart not found"})
    }
        return res.status(200).json({ error: false, existCart, message: "Cart detailed retreived"});

    } catch(err){
        return res.status(500).json({error: true, message: "Server error", details: err.message })
    }
})

//Delete an cart-item and update cart total price
router.delete("/cartItem/:itemId", async (req, res) => {
    const { itemId } = req.params;

    try {
        // Find the item to get its total price before deletion
        const cartItem = await CartItem.findById(itemId);
        if (!cartItem) {
            return res.status(404).json({ error: true, message: "cart item not found" });
        }

        const itemTotal = cartItem.totalPrice;

        // Delete the cart item
        await CartItem.findByIdAndDelete(itemId);

        // Decrement the total from the associated cart
        await Cart.findByIdAndUpdate(
            cartItem.cartId,
            { $inc: { total: -itemTotal } },  // Subtract the item total from the cart total
            { new: true }                     // Return the updated cart
        );

        return res.status(200).json({ 
            error: false, 
            message: "cart item deleted and total updated" 
        });

    } catch (err) {
        return res.status(500).json({ error: true, message: "Server error", details: err.message });
    }
});

//Update size & color & quantity
router.patch("/cartItem/:itemId", async (req, res) => {
    const { itemId } = req.params;
    const { selectedSize, selectedColor, quantity } = req.body;

    // Check for at least one field to update
    if (!selectedSize && !selectedColor && !quantity) {
        return res.status(400).json({
            error: true,
            message: "No update fields provided"
        });
    }

    try {
        // Find the existing cart item
        const cartItem = await CartItem.findById(itemId);
        if (!cartItem) {
            return res.status(404).json({
                error: true,
                message: "cart item not found"
            });
        }

        // Calculate the difference in the total price if the quantity changes
        const oldTotal = cartItem.totalPrice;
        if (quantity) {
            cartItem.quantity = quantity;
            cartItem.totalPrice = cartItem.quantity * cartItem.unitPrice;
        }

        // Update size and color if provided
        if (selectedSize) {cartItem.selectedSize = selectedSize};
        if (selectedColor) {cartItem.selectedColor = selectedColor};

        // Save the updated cart item
        await cartItem.save();

        // Update the associated cart's total
        const difference = cartItem.totalPrice - oldTotal;
        await Cart.findByIdAndUpdate(
            cartItem.cartId,
            { $inc: { total: difference } },  // Update total with the difference
            { new: true }
        );

        return res.status(200).json({
            error: false,
            cartItem,
            message: "Cart item updated successfully"
        });

    } catch (err) {
        return res.status(500).json({
            error: true,
            message: "Server error",
            details: err.message
        });
    }
});

//Batch deletion
// Batch delete cart items by IDs
router.delete("/cartItem", async (req, res) => {
    const { itemIds } = req.body;

    // Validate that itemIds is an array and not empty
    if (!Array.isArray(itemIds) || itemIds.length === 0) {
        return res.status(400).json({
            error: true,
            message: "itemIds must be a non-empty array"
        });
    }

    try {
        // Find the items to be deleted and calculate the total reduction
        const itemsToDelete = await CartItem.find({ _id: { $in: itemIds } });

        if (itemsToDelete.length === 0) {
            return res.status(404).json({
                error: true,
                message: "No matching cart items found"
            });
        }

        // Group items by cartId to update totals correctly
        const cartTotals = {};
        itemsToDelete.forEach(item => {
            if (!cartTotals[item.cartId]) cartTotals[item.cartId] = 0;
            cartTotals[item.cartId] += item.totalPrice;
        });

        // Remove the items from the database
        await CartItem.deleteMany({ _id: { $in: itemIds } });

        // Update the total of each affected cart
        await Promise.all(Object.entries(cartTotals).map(async ([cartId, totalReduction]) => {
            await Cart.findByIdAndUpdate(cartId, { $inc: { total: -totalReduction } });
        }));

        return res.status(200).json({ 
            error: false, 
            message: "cart items deleted successfully", 
            deletedCount: itemsToDelete.length 
        });

    } catch (err) {
        return res.status(500).json({ 
            error: true, 
            message: "Server error", 
            details: err.message 
        });
    }
});

export default router