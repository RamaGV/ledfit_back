// src/controllers/ejercicioController.ts

import { Request, Response } from "express";
import Ejercicio from "../models/Ejercicio";

// GET: Listar todos los controles
export const getAllEjercicios = async (req: Request, res: Response) => {
  try {
    const ejercicios = await Ejercicio.find({});

    res.json(ejercicios);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los ejercicios", error });
  }
};

// GET: Obtener ejercicio por ID
export const getEjercicioById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ejercicio = await Ejercicio.findById(id);
    if (!ejercicio) {
      return res.status(404).json({ message: "Ejercicio no encontrado" });
    }

    res.json(ejercicio);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el ejercicio", error });
  }
};
