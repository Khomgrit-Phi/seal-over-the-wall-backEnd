import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";

const CartItemSchema = new Schema({
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, default: 1 },
    selectedSize: { type: String, required: true },
    selectedColor: { type: String, required: true },
    addedAt: { type: Date, default: Date.now }
  }, { _id: true });

const CartSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    sessionId: { type: String },
    items: { type: [CartItemSchema], default: [] },
    status: {
      type: String,
      enum: ['active', 'abandoned', 'converted'],
      default: 'active'
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  });

export const Cart = model("Cart", CartSchema)
export const CartItem = model("CartItem", CartItemSchema)