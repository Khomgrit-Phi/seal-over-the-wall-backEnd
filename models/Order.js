import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";

const OrderItemSchema = new Schema(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    totalPrice: {
      type: Number,
      default: function () {
        return this.quantity * this.unitPrice;
      },
    },
    selectedSize: { type: String, required: true },
    selectedColor: { type: String, required: true },
    selectedImage: { type: String, required: true },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

OrderItemSchema.pre("save", function (next) {
  this.totalPrice = this.quantity * this.unitPrice;
  next();
});

const OrderSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  items: { type: [OrderItemSchema], required: true, default: [] },
  shippingMethod: { type: String, enum: ["standard", "fastest", "cod"], default: "standard"},
  status: {type: String, enum: ["pending", "paid", "shipped", "delivered", "cancelled"], default: "pending",},
  total: { type: Number, default: 0 },
  vat: { type: Number, default: 7 },
  address: {
    address: { type: String, required: true },
    specific: { type: String },
    district: { type: String, required: true },
    subDistrict: { type: String, required: true },
    city: { type: String, required: true },
    postal: { type: String, required: true },
  },
  payment: {
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    cardNumber: {type: String, required: true},
    exp:{type: String, required: true},
    cvv: {type: String, required: true},
  },
  orderDate: { type: Date, default: Date.now },
});

export const Order = model("Order", OrderSchema);
export const OrderItem = model("OrderItem", OrderItemSchema);

// Hash cardNumber before saving
OrderSchema.pre("save", async (next) => {
  if (this.isModified("cardNumber")) {
    this.cardNumber = await bcrypt.hash(this.cardNumber, 10);
  }

  if (this.isModified("cvv")) {
    this.cvv = await bcrypt.hash(this.cvv, 10);
  }

  next();
});