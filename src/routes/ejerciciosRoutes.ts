// src/routes/ejerciciosRoutes.ts

import { getAllEjercicios, getEjercicioById } from "../controllers/ejercicioController";
import express from "express";

const router = express.Router();

// GET /api/ejercicios -> Lista todos los ejercicios
router.get("/", getAllEjercicios);

// GET /api/ejercicios/:id -> Obtiene un ejercicio por ID
router.get("/:id", (req, res) => {
  getEjercicioById(req, res);
});

export default router;
