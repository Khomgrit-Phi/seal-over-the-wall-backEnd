import express from "express"



const router = express.Router()

export default (db) => {
    router.use("/mongo",mongoUsers);
    router.use("/mongo",mongoNotes);

    return router
};