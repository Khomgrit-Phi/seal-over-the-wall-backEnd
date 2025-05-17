import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import routes from "./api/routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.set("trust proxy", 1);

const corsOptions = {
  origin: ['http://localhost:5173', 'https://seal-over-the-wall.vercel.app'], // Adjust for your Vercel frontend URL
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/", routes);

// MongoDB and Server Initialization
(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`✅ Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
})();
