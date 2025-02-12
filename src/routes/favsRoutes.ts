// src/routes/favsRoutes.ts

import express from "express";
import { protect } from "../middlewares/authMiddleware";
import User from "../models/User";
import { addFav, getFavs, removeFav } from "../controllers/favsController";

const router = express.Router();

// GET /api/favs -> Lista los ejercicios favoritos del usuario autenticado
router.get("/favs", protect, getFavs);

// Agregar un favorito: POST /api/favs/agregar/:entrenamientoId
router.post("/favs/agregar/:entrenamientoId", protect, addFav);

// Eliminar un favorito: DELETE /api/favs/eliminar/:entrenamientoId
router.delete("/favs/eliminar/:entrenamientoId", protect, removeFav);

export default router;
