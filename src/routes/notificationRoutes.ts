// src/routes/notificationRoutes.ts

import express from "express";
import {
  getNotifications,
  markNotificationAsRead,
  createNotification,
} from "../controllers/notificationController";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

// Obtener notificaciones (opcionalmente, se puede pasar un userId en query para pruebas)
router.get("/", protect, getNotifications);

// Marcar una notificación como leída
router.patch("/:notificationId/read", protect, markNotificationAsRead);

// Crear una nueva notificación
router.post("/", protect, createNotification);

export default router;
