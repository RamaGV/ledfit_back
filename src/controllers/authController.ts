// src/controllers/authController.ts

import { Request, Response } from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

import Notification from "../models/Notification";
import User, { IUser } from "../models/User";

// Extiende la interfaz de Request para incluir `user`
interface AuthenticatedRequest extends Request {
  user?: IUser;
}

// Generar token JWT
const generateToken = (id: mongoose.Types.ObjectId): string => {
    return jwt.sign({ id }, process.env.JWT_SECRET as string, {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    });
  };

// Registro de usuario
export const register = async (req: Request, res: Response): Promise<void> => {
    const { name, email, password } = req.body;
    console.log("Datos recibidos:", { name, email, password });
  
    try {
      const userExists = await User.findOne({ email: email });
      if (userExists) {
        res.status(400).json({ message: "El usuario ya existe" });
        return;
      }

      const user = await User.create({ name, email, password });
      console.log("Usuario creado:", user);
      const token = generateToken(user._id as mongoose.Types.ObjectId);
      console.log("Token generado:", token);
      res.status(201).json({ token, user: { id: user._id, name, email, favs: user.favs } });
    } catch (error) {
      console.error("Error en register:", error);
      res.status(500).json({ message: "Error al registrar usuario" });
    }
  };

// Login de usuario
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: "Credenciales inválidas" });
      return;
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      res.status(400).json({ message: "Credenciales inválidas" });
      return;
    }

    const token = generateToken(user._id as mongoose.Types.ObjectId);

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        favs: user.favs,
        logros: user.logros, // Agregado
        caloriasQuemadas: user.caloriasQuemadas,
        tiempoEntrenado: user.tiempoEntrenado,
        entrenamientosCompletos: user.entrenamientosCompletos,
      },
    });  
  } catch (error) {
    res.status(500).json({ message: "Error al iniciar sesión" });
  }
};

// Registro o login con proveedor OAuth (Google, Facebook, Apple)
export const oauthSignIn = async (req: Request, res: Response): Promise<void> => {
  const { name, email, oauthProvider, oauthId } = req.body;
  
  try {
    // Verificar si el usuario ya existe por email o por oauthId
    let user = await User.findOne({ 
      $or: [
        { email },
        { oauthId, oauthProvider } // Asumiendo que estos campos existen en tu modelo
      ]
    });
    
    // Si no existe, lo creamos
    if (!user) {
      // Generamos una contraseña aleatoria, ya que el usuario usará siempre OAuth
      const randomPassword = Math.random().toString(36).slice(-10);
      
      user = await User.create({
        name,
        email,
        password: randomPassword,
        oauthProvider,
        oauthId,
        // Inicializar los valores por defecto
        logros: [],
        caloriasQuemadas: 0,
        tiempoEntrenado: 0,
        entrenamientosCompletos: 0,
        favs: []
      });
      
      console.log(`Usuario creado desde ${oauthProvider}:`, user.name);
    } else {
      // Actualizar los datos del proveedor OAuth si no están presentes
      if (!user.oauthId || !user.oauthProvider) {
        user.oauthId = oauthId;
        user.oauthProvider = oauthProvider;
        await user.save();
      }
    }
    
    // Generar token
    const token = generateToken(user._id as mongoose.Types.ObjectId);
    
    // Responder con token y datos del usuario
    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        favs: user.favs,
        logros: user.logros,
        caloriasQuemadas: user.caloriasQuemadas,
        tiempoEntrenado: user.tiempoEntrenado,
        entrenamientosCompletos: user.entrenamientosCompletos,
      },
    });
  } catch (error) {
    console.error('Error en oauthSignIn:', error);
    res.status(500).json({ message: "Error al procesar autenticación OAuth" });
  }
};

// Obtener perfil del usuario autenticado
export const getUserProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: "No autorizado" });
    return;
  }

  res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    favs: req.user.favs,
    logros: req.user.logros,
    caloriasQuemadas: req.user.caloriasQuemadas,
    tiempoEntrenado: req.user.tiempoEntrenado,
    entrenamientosCompletos: req.user.entrenamientosCompletos
  });
};

// Obtener favoritos del usuario 
export const getFavs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: "Usuario no autenticado" });
    return;
  }
  res.json({ favs: req.user.favs || [] });
};

// Agregar un entrenamiento a favoritos
export const addFav = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: "Usuario no autenticado" });
    return;
  }
  const { entrenamientoId } = req.params;
  try {
    // Evitar duplicados (asumiendo que usas 'favs' en el modelo)
    if (req.user.favs && req.user.favs.includes(new mongoose.Types.ObjectId(entrenamientoId))) {
      res.status(400).json({ message: "El entrenamiento ya está en favoritos" });
      return;
    }
    req.user.favs = req.user.favs || [];
    req.user.favs.push(new mongoose.Types.ObjectId(entrenamientoId));
    await req.user.save();
    res.json({ favs: req.user.favs });
  } catch (error) {
    res.status(500).json({ message: "Error al agregar a favoritos", error });
  }
};

// Eliminar un entrenamiento de favoritos
export const removeFav = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: "Usuario no autenticado" });
    return;
  }
  const { entrenamientoId } = req.params;
  try {
    req.user.favs = (req.user.favs || []).filter(
      (fav) => fav.toString() !== entrenamientoId
    );
    await req.user.save();
    res.json({ favs: req.user.favs });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar de favoritos", error });
  }
};

// Endpoint para actualizar las métricas de la sesión
export const updateMetricas = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "No autorizado" });
      return;
    }

    const { tiempo, calorias } = req.body;

    console.log("Datos recibidos:", { tiempo, calorias });
    req.user.tiempoEntrenado += tiempo; // Actualiza el tiempo entrenado
    req.user.caloriasQuemadas += calorias; // Actualiza las calorías quemadas
    req.user.entrenamientosCompletos += 1; // Actualiza el número de entrenamientos completados

    console.log("Métricas actualizadas:", {
      tiempoEntrenado: req.user.tiempoEntrenado,
      caloriasQuemadas: req.user.caloriasQuemadas,
    });

    // Guarda los cambios en la base de datos
    await req.user.save();

    res.status(200).json({
      message: "Métricas actualizadas correctamente",
      tiempoEntrenado: req.user.tiempoEntrenado,
      caloriasQuemadas: req.user.caloriasQuemadas,
      entrenamientosCompletos: req.user.entrenamientosCompletos,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar métricas", error });
  }
};

// Función para actualizar los logros del usuario y crear notificaciones
export const updateLogros = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "No autorizado" });
      return;
    }

    // Registra el estado actual de los logros del usuario
    console.log("Logros actuales:", req.user.logros);

    const { tiempoEntrenado, caloriasQuemadas, entrenamientosCompletos } = req.user;

    // Guarda una copia de los logros antes de actualizarlos
    const previousLogros = req.user.logros.map((logro) => ({ ...logro }));

    // Actualiza cada logro según su tipo y el umbral
    const updatedLogros = req.user.logros.map((logro) => {
      const threshold = Number(logro.key);
      let obtenido = logro.obtenido; // Conserva el estado actual
      if (logro.type === "time" && tiempoEntrenado >= threshold) {
        obtenido = true;
      } else if (logro.type === "plus" && entrenamientosCompletos >= threshold) {
        obtenido = true;
      } else if (logro.type === "check" && caloriasQuemadas >= threshold) {
        obtenido = true;
      }
      return { ...logro, obtenido };
    });

    console.log("Logros actualizados:", updatedLogros);

    // Procesa cada logro secuencialmente para crear notificaciones
    for (const [index, newLogro] of updatedLogros.entries()) {
      const prevLogro = previousLogros[index];
      if (!prevLogro.obtenido && newLogro.obtenido) {
        const notification = new Notification({
          user: req.user._id,
          title: newLogro.title || "Logro alcanzado",
          // Asigna un valor por defecto si newLogro.content es undefined
          content: newLogro.content || "¡Has alcanzado un nuevo logro!",
          type: newLogro.type,
        });
        try {
          await notification.save();
          console.log(`Notificación guardada para logro: ${newLogro.title}`);
        } catch (notifError) {
          console.error(`Error al guardar la notificación para el logro ${newLogro.title}:`, notifError);
          throw notifError;
        }
      }
    }

    // Actualiza los logros del usuario y guarda en la BD
    req.user.logros = updatedLogros;
    await req.user.save();
    console.log("Usuario actualizado con nuevos logros:", req.user.logros);

    res.status(200).json({ logros: req.user.logros });
    return;
  } catch (error: any) {
    console.error("Error en updateUserLogros:", error);
    res.status(500).json({ message: "Error al actualizar logros", error: error.message });
    return;
  }
};

// Actualizar perfil de usuario
export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "No autorizado" });
      return;
    }

    const { name, email, profileImage } = req.body;
    const userId = req.user._id;

    // Validar datos
    if (email) {
      const emailExists = await User.findOne({ email, _id: { $ne: userId } });
      if (emailExists) {
        res.status(400).json({ message: "Este email ya está en uso por otro usuario" });
        return;
      }
    }

    // Construir objeto de actualización
    const updateData: { name?: string; email?: string } = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    
    // Nota: La actualización de la imagen de perfil requeriría implementar
    // almacenamiento de archivos o manejo de URLs, se podría agregar después

    // Actualizar usuario
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    );

    if (!updatedUser) {
      res.status(404).json({ message: "Usuario no encontrado" });
      return;
    }

    // Responder con los datos actualizados
    res.status(200).json({
      name: updatedUser.name,
      email: updatedUser.email,
      message: "Perfil actualizado correctamente"
    });
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    res.status(500).json({ message: "Error al actualizar el perfil" });
  }
};

// Actualizar contraseña de usuario
export const updatePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "No autorizado" });
      return;
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    // Validar datos
    if (!currentPassword || !newPassword) {
      res.status(400).json({ message: "Se requiere la contraseña actual y la nueva" });
      return;
    }

    // Verificar contraseña actual
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "Usuario no encontrado" });
      return;
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      res.status(400).json({ message: "Contraseña actual incorrecta" });
      return;
    }

    // Actualizar contraseña
    user.password = newPassword;
    await user.save(); // Aquí se ejecutará el pre-save hook para hashear la contraseña

    res.status(200).json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error("Error al actualizar contraseña:", error);
    res.status(500).json({ message: "Error al actualizar la contraseña" });
  }
};