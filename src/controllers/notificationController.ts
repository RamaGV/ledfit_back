// src/controllers/notificationController.ts

import { Request, Response } from "express";
import Notification from "../models/Notification";
import { IUser } from "../models/User";

// Interfaz local para claridad (opcional pero recomendado)
interface AuthenticatedRequest extends Request {
  user?: IUser;
}

// Obtiene las notificaciones del usuario autenticado a partir del token
export const getNotifications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Se usa siempre el id obtenido del middleware protect
    const userId = req.user?._id;
    console.log("ID del usuario autenticado:", userId);
    if (!userId) {
      res.status(400).json({ message: "No se encontró el usuario autenticado" });
      return;
    }
    // Modificado para excluir notificaciones marcadas como eliminadas
    const notifications = await Notification.find({ 
      user: userId,
      deleted: { $ne: true } // Excluir notificaciones eliminadas
    }).sort({ date: -1 });
    res.json({ notifications });
    return;
  } catch (error) {
    res.status(500).json({ message: "Error al obtener notificaciones", error });
    return;
  }
};

// Marca una notificación como leída
export const markNotificationAsRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      res.status(404).json({ message: "Notificación no encontrada" });
      return;
    }
    notification.read = true;
    await notification.save();
    res.json({ message: "Notificación marcada como leída" });
    return;
  } catch (error) {
    res.status(500).json({ message: "Error al marcar notificación como leída", error });
    return;
  }
};

// Marca una notificación como eliminada
export const deleteNotification = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findById(notificationId);
    
    if (!notification) {
      res.status(404).json({ message: "Notificación no encontrada" });
      return;
    }
    
    // Verificar que la notificación pertenece al usuario autenticado
    const userId = req.user?._id;
    if (!userId || notification.user.toString() !== userId.toString()) {
      res.status(403).json({ message: "No tienes permiso para eliminar esta notificación" });
      return;
    }
    
    // Marcar como eliminada en lugar de eliminar físicamente
    notification.deleted = true;
    await notification.save();
    
    res.json({ message: "Notificación eliminada correctamente" });
    return;
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar la notificación", error });
    return;
  }
};

// Crea una notificación para el usuario autenticado (no se envía el id en el body)
export const createNotification = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { title, message } = req.body; // Se espera title y message en el body
    const userId = req.user?._id; // Se extrae el id del usuario del token
    if (!userId) {
      res.status(400).json({ message: "Usuario no autenticado" });
      return;
    }
    // Se utiliza "content" en lugar de "message" para que coincida con el modelo
    const notification = new Notification({ title, content: message, user: userId });
    await notification.save();
    res.json({ message: "Notificación creada" });
    return;
  } catch (error) {
    res.status(500).json({ message: "Error al crear notificación", error });
    return;
  }
};
