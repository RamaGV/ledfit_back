// src/controllers/authController.ts

import { Request, Response } from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

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
    res.status(200).json({ token, user: { id: user._id, name: user.name, email, favs: user.favs } });
  } catch (error) {
    res.status(500).json({ message: "Error al iniciar sesión" });
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
    favs: req.user.favs || []
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

// Función para actualizar las calorías quemadas del usuario autenticado
export const updateCaloriasQuemadas = async (req: Request, res: Response): Promise<void> => {
  try {
    // Se asume que el middleware protect coloca al usuario en req.user
    if (!req.user) {
      res.status(401).json({ message: "No autorizado" });
      return;
    }
    const { calorias } = req.body; // Se espera enviar las calorías quemadas en esta sesión
    if (typeof calorias !== "number") {
      res.status(400).json({ message: "El valor de calorías es inválido" });
      return;
    }
    
    // Actualiza sumando las calorías a las que ya lleva el usuario
    req.user.caloriasQuemadas += calorias;
    await req.user.save();
    res.status(200).json({ 
      message: "Calorías actualizadas correctamente",
      caloriasQuemadas: req.user.caloriasQuemadas
    });
    return;
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar calorías", error });
    return;
  }
};
