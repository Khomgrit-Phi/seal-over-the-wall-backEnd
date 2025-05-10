// import { User, Address, Creator } from "../../models/User.js";
import express from "express";
import { User } from "../../models/User.js";

const router = express.Router();

router.post("/signUp", async (req, res) => {
  const { firstName, email, password, phoneNumber, userName, lastName, addresses = [] } = req.body;
  if (!firstName || !lastName || !email ||  !password ||  !phoneNumber ||  !userName) {
    return res.status(400).json({ error: true, message: "All fields are required." });
  }

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
router.post("/signIn", async (req, res) => {
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


//Login with cookies
router.post("cookie/signIn", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ error: true, message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ error: true, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ error: true, message: "Incorrect password" });
    }

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "12h", // 12 hour expiration
    });

    const isProd = process.env.NODE_ENV === "production";

    // Set token in HttpOnly cookie
    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: isProd, // only send over HTTPS in prod
      sameSite: isProd ? "none" : "lax",
      path: "/",
      maxAge: 720 * 60 * 1000, // 12 hour
    });

    res.status(200).json({
      error: false,
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        fullName: user.fullName,
      }, // send some safe public info if needed
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: true, message: "Server error", details: err.message });
  }
});


//Logout to clear cookies
router.post("/auth/logout", (req, res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });
  res.status(200).json({ message: "Logged out successfully" });
});

export default router;