import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";

const PaymentSchema = new Schema(
  {
    amount: { type: Number, required: true },
    method: { type: String, enum: ["creditCard", "prompPay"], required: true },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    cardName: { type: String, required: true },
    cardNumber: { type: String, required: true },
    cvv: { type: String, required: true },
    paymentDate: { type: Date, default: Date.now },
  },
  { _id: true }
);

// Hash cardNumber before saving
PaymentSchema.pre("save", async function (next) {
  if (this.isModified("cardNumber")) {
    this.cardNumber = await bcrypt.hash(this.cardNumber, 10);
  }

  if (this.isModified("cvv")) {
    this.cvv = await bcrypt.hash(this.cvv, 10);
  }

  next();
});

export const Payment = model("Payment", PaymentSchema);
