import express from "express"
import productRoute from "./routes/productRoute.js"
import userRoute from "./routes/userRoute.js";
import cartRoute from "./routes/cartRoute.js";
import paymentRoute from "./routes/paymentRoute.js";
import orderRoute from "./routes/orderRoute.js";


const router = express.Router()

export default () => {
    router.use("/user",userRoute);
    router.use("/product",productRoute);
    router.use("/diy",diyRoute);
    router.use("/cart",cartRoute);
    router.use("/order",orderRoute);
    router.use("/payment",paymentRoute);


    return router
};