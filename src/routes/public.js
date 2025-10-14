// src/routes/public.js
import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
    res.send("Public route is working!");
});

export default router;
