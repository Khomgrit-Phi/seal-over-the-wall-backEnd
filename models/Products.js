import { Schema, model } from "mongoose";

const ProductSchema = new Schema({
    productType: { type: String, required: true },
    styleName: { type: String, required: true },
    title: { type: String, required:true, default: {styleName}+' - '+{productType} },
    description: { type: String },
    price: { type: Number, default: 499, required:true },
    size: { type: [String], required: true },
    color: { type: [Object]},
    createdOn: { type: Date, default: new Date().getTime() },
});

export const Note = model("Products", ProductSchema)