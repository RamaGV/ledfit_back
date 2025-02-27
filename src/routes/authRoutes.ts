import express from "express";

import { 
  register, 
  login, 
  getUserProfile, 
  getFavs, 
  addFav, 
  removeFav, 
  updateEntrenamientosCompletos,
  updateCaloriasQuemadas,
  updateTiempoEntrenado,
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

// Ruta para actualizar las calorías quemadas:
router.patch("/update-entrenamientos", protect, updateEntrenamientosCompletos);
router.patch("/update-calorias", protect, updateCaloriasQuemadas);
router.patch("/update-tiempo", protect, updateTiempoEntrenado);


// Nueva ruta para actualizar los logros del usuario:
router.patch("/update-logros", protect, updateUserLogros);

export default router;
