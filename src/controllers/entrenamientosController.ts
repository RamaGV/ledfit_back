// src/controllers/entrenamientosController.ts

import { Request, Response } from "express";
import Entrenamiento from "../models/Entrenamiento";

// GET: Listar todos los entrenamientos
export const getAllEntrenamientos = async (req: Request, res: Response) => {
  try {
    const entrenamientos = await Entrenamiento.find({}).populate("ejercicios.ejercicioId");
    console.log("[Backend Log] Entrenamientos fetched:", JSON.stringify(entrenamientos, null, 2));
    res.json(entrenamientos);
  } catch (error) {
    console.error("Error getAllEntrenamientos:", error);
    res.status(500).json({ message: "Error al obtener entrenamientos", error });
  }
};

// GET: Obtener entrenamiento por ID
export const getEntrenamientoById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const entrenamiento = await Entrenamiento.findById(id).populate("ejercicios.ejercicioId");

    if (!entrenamiento) {
      return res.status(404).json({ message: "Entrenamiento no encontrado" });
    }
    console.log("[Backend Log] Entrenamiento by ID fetched:", JSON.stringify(entrenamiento, null, 2));
    return res.json(entrenamiento);
  } catch (error) {
    console.error("Error getEntrenamientoById:", error);
    return res.status(500).json({ message: "Error al obtener el entrenamiento", error });
  }
};

