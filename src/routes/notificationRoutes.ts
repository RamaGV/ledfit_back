// src/routes/notificationRoutes.ts

import express from "express";
import { getNotifications } from "../controllers/notificationController";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/", protect, getNotifications);

export default router;
