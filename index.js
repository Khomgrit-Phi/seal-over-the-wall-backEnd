import express from "express"
import dotenv from "dotenv"
import cors from "cors";
import mongoose from "mongoose"
import cookieParser from "cookie-parser";

dotenv.config()
const PORT = process.env.PORT || 0

const app = express();
app.use(express.json());



(async () => {
    try {
        // Connect to MongoDB via Mongoose
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to Mongo database ✅");
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT} ✅`)
        })
    } catch (err) {
        console.error("❌ MongoDB connection error:", err);
        process.exit(1);
    }
})()


