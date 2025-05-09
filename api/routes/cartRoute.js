import express from "express";
import { Cart, CartItem } from "../../models/Cart.js";
import mongoose from "mongoose";

const router = express.Router();

//Create a cart
router.post("/", async (req, res) => {
  const {
    sessionId = " ",
    userId,
    items = [],
    status,
    total = 0,
    vat = 7,
  } = req.body;
  if (!userId || !status) {
    return res.status(400).json({
      error: true,
      message: "The information is not fulfilled",
    });
  }

  try {
    const cart = new Cart({
      sessionId,
      userId: new mongoose.Types.ObjectId(userId),
      items:
        items?.map((item) => ({
          ...item,
          productId: new mongoose.Types.ObjectId(item.productId),
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor,
          unitPrice: item.unitPrice || 0,
        })) || [], // Handle case where items might be undefined
      status,
      total,
      vat,
    });
    await cart.save();

    return res.status(201).json({
      error: false,
      cart,
      message: "The cart is create successfully",
    });
  } catch (err) {
    return res.status(500).json({
      error: true,
      message: "Server error",
      details: err.message,
    });
  }
});

//Get a cart
router.get("/:cartId", async (req, res) => {
  const { cartId } = req.params;
  if (!cartId) {
    return res.status(400).json({
      error: true,
      message: "The information is not fulfilled",
    });
  }

  try {
    const existCart = await Cart.findById(cartId).populate({
      path: "items.productId",
      select: "image title",
    });

    if (!existCart) {
      return res.status(404).json({
        error: true,
        message: "Cart not found",
      });
    }
    return res.status(200).json({
      error: false,
      cart: existCart,
      message: "Cart detailed retreived",
    });
  } catch (err) {
    return res.status(500).json({
      error: true,
      message: "Server error",
      details: err.message,
    });
  }
});

// Add item to cart
router.post("/:cartId/items", async (req, res) => {
  const { cartId } = req.params;
  const {
    productId,
    quantity = 1,
    unitPrice,
    selectedColor,
    selectedSize,
  } = req.body;

  if (!productId || !unitPrice || !selectedColor || !selectedSize) {
    return res.status(400).json({
      error: true,
      message: "Please complete all required product details",
    });
  }

  try {
    const cart = await Cart.findById(cartId);
    if (!cart) {
      return res.status(404).json({
        error: true,
        message: "Cart not found",
      });
    }

    // Create new item
    const newItem = {
      productId: new mongoose.Types.ObjectId(productId),
      quantity,
      unitPrice,
      selectedSize,
      selectedColor,
    };

    // Update item in cart
    cart.items.push(newItem);

    // update total and updatedAt
    cart.total += quantity * unitPrice;
    cart.updatedAt = new Date();

    // save cart
    await cart.save();

    return res.status(200).json({
      error: false,
      cart,
      message: "Item added to cart successfully",
    });
  } catch (err) {
    return res.status(500).json({
      error: true,
      message: "Server error",
      details: err.message,
    });
  }
});

// Remove item from cart
router.delete("/:cartId/items/:itemId", async (req, res) => {
  const { cartId, itemId } = req.params;

  try {
    const cart = await Cart.findById(cartId);
    if (!cart) {
      return res.status(404).json({
        error: true,
        message: "Cart not found",
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === itemId
    );
    if (itemIndex === -1) {
      return res.status(404).json({
        error: true,
        message: "Item not found in cart",
      });
    }

    const itemTotal = cart.items[itemIndex].totalPrice;

    cart.items.splice(itemIndex, 1);

    cart.total -= itemTotal;
    cart.updatedAt = new Date();

    await cart.save();

    return res.status(200).json({
      error: false,
      cart,
      message: "Item removed from cart successfully",
    });
  } catch (err) {
    return res.status(500).json({
      error: true,
      message: "Server error",
      details: err.message,
    });
  }
});

//Delete an cart-item and update cart total price
router.delete("/cartItem/:itemId", async (req, res) => {
  const { itemId } = req.params;

  try {
    // Find the item to get its total price before deletion
    const cartItem = await CartItem.findById(itemId);
    if (!cartItem) {
      return res
        .status(404)
        .json({ error: true, message: "cart item not found" });
    }

    const itemTotal = cartItem.totalPrice;

    // Delete the cart item
    await CartItem.findByIdAndDelete(itemId);

    // Decrement the total from the associated cart
    await Cart.findByIdAndUpdate(
      cartItem.cartId,
      { $inc: { total: -itemTotal } }, // Subtract the item total from the cart total
      { new: true } // Return the updated cart
    );

    return res.status(200).json({
      error: false,
      message: "cart item deleted and total updated",
    });
  } catch (err) {
    return res
      .status(500)
      .json({ error: true, message: "Server error", details: err.message });
  }
});

// Update color'item
router.patch("/:cartId/items/:itemId/color", async (req, res) => {
  const { cartId, itemId } = req.params;
  const { selectedColor } = req.body;

  if (!selectedColor) {
    return res.status(400).json({
      error: true,
      message: "Selected color is required",
    });
  }

  try {
    const cart = await Cart.findById(cartId);
    if (!cart) {
      return res.status(404).json({
        error: true,
        message: "Cart not found",
      });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        error: true,
        message: "Item not found in cart",
      });
    }

    item.selectedColor = selectedColor;

    cart.updatedAt = new Date();

    await cart.save();

    return res.status(200).json({
      error: false,
      cart,
      item,
      message: "Item color updated successfully",
    });
  } catch (err) {
    return res.status(500).json({
      error: true,
      message: "Server error",
      details: err.message,
    });
  }
});
// Update size'item
router.patch("/:cartId/items/:itemId/size", async (req, res) => {
  const { cartId, itemId } = req.params;
  const { selectedSize } = req.body;

  if (!selectedSize) {
    return res.status(400).json({
      error: true,
      message: "Selected size is required",
    });
  }

  try {
    const cart = await Cart.findById(cartId);
    if (!cart) {
      return res.status(404).json({
        error: true,
        message: "Cart not found",
      });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        error: true,
        message: "Item not found in cart",
      });
    }

    item.selectedSize = selectedSize;

    cart.updatedAt = new Date();

    await cart.save();

    return res.status(200).json({
      error: false,
      cart,
      item,
      message: "Item size updated successfully",
    });
  } catch (err) {
    return res.status(500).json({
      error: true,
      message: "Server error",
      details: err.message,
    });
  }
});

//Update quantity
router.patch("/:cartId/items/:itemId/quantity", async (req, res) => {
  const { cartId, itemId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity <= 0) {
    return res.status(400).json({
      error: true,
      message: "Valid quantity is required (must be greater than 0)",
    });
  }

  try {
    const cart = await Cart.findById(cartId);
    if (!cart) {
      return res.status(404).json({
        error: true,
        message: "Cart not found",
      });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        error: true,
        message: "Item not found in cart",
      });
    }

    const oldTotal = item.quantity * item.unitPrice;

    item.quantity = quantity;
    cart.updatedAt = new Date();

    const newTotal = item.quantity * item.unitPrice;
    cart.total = cart.total - oldTotal + newTotal;

    await cart.save();

    return res.status(200).json({
      error: false,
      cart,
      item,
      message: "Item quantity updated successfully",
    });
  } catch (err) {
    return res.status(500).json({
      error: true,
      message: "Server error",
      details: err.message,
    });
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
      message: "No update fields provided",
    });
  }

  try {
    // Find the existing cart item
    const cartItem = await CartItem.findById(itemId);
    if (!cartItem) {
      return res.status(404).json({
        error: true,
        message: "cart item not found",
      });
    }

    // Calculate the difference in the total price if the quantity changes
    const oldTotal = cartItem.totalPrice;
    if (quantity) {
      cartItem.quantity = quantity;
      cartItem.totalPrice = cartItem.quantity * cartItem.unitPrice;
    }

    // Update size and color if provided
    if (selectedSize) {
      cartItem.selectedSize = selectedSize;
    }
    if (selectedColor) {
      cartItem.selectedColor = selectedColor;
    }

    // Save the updated cart item
    await cartItem.save();

    // Update the associated cart's total
    const difference = cartItem.totalPrice - oldTotal;
    await Cart.findByIdAndUpdate(
      cartItem.cartId,
      { $inc: { total: difference } }, // Update total with the difference
      { new: true }
    );

    return res.status(200).json({
      error: false,
      cartItem,
      message: "Cart item updated successfully",
    });
  } catch (err) {
    return res.status(500).json({
      error: true,
      message: "Server error",
      details: err.message,
    });
  }
});

export default router;
