import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";

const ColorSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    colorName: { type: String, required: true },
    colorCode: { type: String, required: true },
    image: { type: [String], required: true },
  },
  { _id: false }
);

const ProductSchema = new Schema({
  productType: { type: String, required: true },
  styleName: { type: String, required: true },
  title: {
    type: String,
    required: true,
    default: { styleName } + " - " + { productType },
  },
  description: { type: String },
  price: { type: Number, default: 499, required: true },
  size: { type: [String], required: true },
  color: { type: [ColorSchema], required: true },
  tag: { type: [String], default: [] },
  createdOn: { type: Date, default: new Date().getTime() },
});

export const Product = model("Product", ProductSchema);
export const Color = model("Color", ColorSchema);
