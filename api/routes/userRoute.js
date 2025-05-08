// import { User, Address, Creator } from "../../models/User.js";
import express from "express";
import { authUser } from "../../middlewares/auth.js";
import { User } from "../../models/User.js";

const router = express.Router();

router.post("/register", authUser, async (req, res) => {
  const { firstName, email, password, phoneNumber, userName, lastName, addresses } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: true, message: "Email already in use" });
    }

    const user = await User.create({ firstName, email, password, phoneNumber, userName, lastName, addresses });

    res.status(201).json({ error: false, message: "User registered successfully", user });
  } catch (err) {
    res.status(500).json({ error: true, message: "Server error", details: err.message });
  }
});

//Login
router.post("/sign-in", async (req, res) => {
  const {email, password} = req.body;
  if (!email || !password) {
    return res.status(400).json({err: true, message: "information "});
  }

  try{
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({err: true, message: "User not found"});
    }

    return key

  } catch (err) {
    res.status(500).json({ error: true, message: "Server error", details: err.message });
  }


})

export default router;