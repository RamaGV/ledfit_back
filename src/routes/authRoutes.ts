import express from "express";

import { 
  register, 
  login, 
  getUserProfile, 
  getFavs, 
  addFav, 
  removeFav, 
  updateMetricas,
  updateLogros,
  updateProfile,
  updatePassword,
  oauthSignIn,
  clerkUser,
} from "../controllers/authController";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/oauth", oauthSignIn);
router.post("/clerk-user", clerkUser);
router.get("/profile", protect, getUserProfile);

// Rutas para favoritos:
router.get("/favs", protect, getFavs);
router.post("/favs/agregar/:entrenamientoId", protect, addFav);
router.delete("/favs/eliminar/:entrenamientoId", protect, removeFav);

// Ruta para actualizar las metricas:
router.patch("/update-metricas", protect, updateMetricas);

// Nueva ruta para actualizar los logros del usuario:
router.patch("/update-logros", protect, updateLogros);

// Nuevas rutas para actualizar perfil y contraseña:
router.patch("/update-profile", protect, updateProfile);
router.patch("/update-password", protect, updatePassword);

export default router;
