// src/routes/medidasActuadoresRoutes.ts

import express from "express";
import { getAllEntrenamientos ,getEntrenamientoById } from "../controllers/entrenamientosController";

const router = express.Router();

// GET /api/entrenamientos -> Lista todos los entrenamientos
router.get("/", getAllEntrenamientos);

// GET /api/entrenamientos/:id -> Obtiene un entrenamiento por ID
router.get("/:id", (req, res) => {
    getEntrenamientoById(req, res);
});

export default router;
