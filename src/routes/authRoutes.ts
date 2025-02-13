// src/routes/authRoutes.ts

import express from "express";

import { register, login, getUserProfile, getFavs, addFav, removeFav } from "../controllers/authController";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", protect, getUserProfile);

// Rutas para favoritos:
router.get("/favs", protect, getFavs);
router.post("/favs/agregar/:entrenamientoId", protect, addFav);
router.delete("/favs/eliminar/:entrenamientoId", protect, removeFav);

export default router;
