import express from "express";

import { 
  register, 
  login, 
  getUserProfile, 
  getFavs, 
  addFav, 
  removeFav, 
  updateMetricas,
  updateUserLogros
} from "../controllers/authController";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", protect, getUserProfile);

// Rutas para favoritos:
router.get("/favs", protect, getFavs);
router.post("/favs/agregar/:entrenamientoId", protect, addFav);
router.delete("/favs/eliminar/:entrenamientoId", protect, removeFav);

// Ruta para actualizar las metricas:
router.patch("/update-metricas", protect, updateMetricas);

// Nueva ruta para actualizar los logros del usuario:
router.patch("/update-logros", protect, updateUserLogros);

export default router;
