// import { User, Address, Creator } from "../../models/User.js";
import express from "express";
import { authUser } from "../../middlewares/auth.js";
import { User } from "../../models/User.js";
import { verify } from "../../middlewares/verify.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/sign-up", authUser, async (req, res) => {
  const {
    firstName,
    email,
    password,
    phoneNumber,
    userName,
    lastName,
    addresses,
  } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ error: true, message: "Email already in use" });
    }

    const user = await User.create({
      firstName,
      email,
      password,
      phoneNumber,
      userName,
      lastName,
      addresses,
    });

    res
      .status(201)
      .json({ error: false, message: "User registered successfully", user });
  } catch (err) {
    res
      .status(500)
      .json({ error: true, message: "Server error", details: err.message });
  }
});

//Sign-in

router.post("/sign-in", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ err: true, message: "Email and password are required." });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res
        .status(401)
        .json({ err: true, message: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ err: true, message: "Invalid credentials." });
    }

    const token = jwt.sign(
      { userId: existingUser._id, email: existingUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: existingUser._id,
        email: existingUser.email,
        userName: existingUser.userName,
      },
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "Server error",
      details: err.message,
    });
  }
});

// Add New Address

router.post("/new-address", verify, async (req, res) => {
  const { address, specific, subDistrict, district, city, postal, isDefault } =
    req.body;

  if (!address || !specific || !subDistrict || !district || !city || !postal) {
    return res
      .status(400)
      .json({ error: true, message: "Missing address fields" });
  }

  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: true, message: "User not found" });
    }

    user.addresses.push({
      address,
      specific,
      subDistrict,
      district,
      city,
      postal,
      isDefault: isDefault || false,
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "Address added successfully",
      addresses: user.addresses,
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: true, message: "Server error", details: err.message });
  }
});

export default router;
