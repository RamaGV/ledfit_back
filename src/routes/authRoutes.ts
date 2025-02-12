// src/routes/authRoutes.ts

import express from "express";

import { register, login, getUserProfile } from "../controllers/authController";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", protect, getUserProfile);

export default router;
