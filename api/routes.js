import express from "express"
import productRoute from "./routes/productRoute"


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