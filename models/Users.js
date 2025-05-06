import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";

const AddressSchema = new Schema(
  {
    address: { type: String, required: true },
    specific: { type: String },
    subDistrict: { type: String, required: true },
    district: { type: String, required: true },
    city: { type: String, required: true },
    postal: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const UsersSchema = new Schema({
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String },
  userName: { type: String, required: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  addresses: { type: [AddressSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
});

// Hash password before saving
UsersSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

export const Address = model("Address", AddressSchema);
export const User = model("Users", UsersSchema);
