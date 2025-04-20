// src/server.ts

import connectDB from "./config/db";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import entenamientosRoutes from "./routes/entrenamientosRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import actuadoresRoutes from "./routes/ejerciciosRoutes";
import authRoutes from "./routes/authRoutes";
import workoutRoutes from "./routes/workoutRoutes";
import boardRoutes from "./routes/boardRoutes";

// Initialize MQTT client (ensure this runs early, maybe after dotenv.config())
import './utils/mqttClient'; // Import to initialize connection

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(cors());

// Rutas
app.use("/api/entrenamientos", entenamientosRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/ejercicios", actuadoresRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/workout", workoutRoutes);
app.use("/api/boards", boardRoutes);

// Middleware 404
app.use((req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
