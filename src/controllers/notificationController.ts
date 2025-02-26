// src/controllers/notificationController.ts

import { Request, Response } from "express";
import Notification from "../models/Notification";

export const getNotifications = async (req: Request, res: Response) => {
  try {
    // Se asume que el middleware auth ya asigna el usuario en req.user
    const userId = req.user?._id;
    const notifications = await Notification.find({ user: userId }).sort({ date: -1 });
    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener notificaciones", error });
  }
};
