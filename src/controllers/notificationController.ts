// src/controllers/notificationController.ts

import { Request, Response } from "express";
import Notification from "../models/Notification";

export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    // Si se envía un userId por parámetros (para pruebas), úsalo. De lo contrario, usa req.user
    const userId = req.params.userId || req.user?._id;
    if (!userId) {
      res.status(400).json({ message: "No se encontró el usuario autenticado" });
      return;
    }
    const notifications = await Notification.find({ user: userId }).sort({ date: -1 });
    res.json({ notifications });
    return;
  } catch (error) {
    res.status(500).json({ message: "Error al obtener notificaciones", error });
    return;
  }
};

export const markNotificationAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      res.status(404).json({ message: "Notificación no encontrada" });
      return;
    }
    notification.read = true;
    await notification.save();
    res.json({ message: "Notificación marcada como leída" });
    return;
  } catch (error) {
    res.status(500).json({ message: "Error al marcar notificación como leída", error });
    return;
  }
};

export const createNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, message, user } = req.body; // Recibes "message" en el body
    // Usa "content" en lugar de "message" para que coincida con el modelo
    const notification = new Notification({ title, content: message, user });
    await notification.save();
    res.json({ message: "Notificación creada" });
    return;
  } catch (error) {
    res.status(500).json({ message: "Error al crear notificación", error });
    return;
  }
};
