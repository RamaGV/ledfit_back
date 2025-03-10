// --- Contenido de /home/rama/Escritorio/Ledfit/ledfit_back/src/server.ts ---
// src/server.ts

import connectDB from "./config/db";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import entenamientosRoutes from "./routes/entrenamientosRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import actuadoresRoutes from "./routes/ejerciciosRoutes";
import authRoutes from "./routes/authRoutes";

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

// Middleware 404
app.use((req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});


// --- Contenido de /home/rama/Escritorio/Ledfit/ledfit_back/src/models/User.ts ---
// src/models/User.ts

import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

export interface ILogro {
  key: string;
  title: string;
  content: string;
  type: "check" | "plus" | "time";
  obtenido: boolean;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  logros: ILogro[];
  favs?: mongoose.Types.ObjectId[];
  caloriasQuemadas: number;
  tiempoEntrenado: number;
  entrenamientosCompletos: number;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const logroSchema: Schema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    type: { type: String, enum: ["check", "plus", "time"], required: true },
    obtenido: { type: Boolean, default: false },
  },
  { _id: false }
);

const userSchema: Schema<IUser> = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    logros: { type: [logroSchema], default: [] },
    favs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Entrenamiento" }],
    caloriasQuemadas: { type: Number, default: 0 },
    tiempoEntrenado: { type: Number, default: 0 },
    entrenamientosCompletos: { type: Number, default: 0 }
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  return next();
});

userSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
export default User;


// --- Contenido de /home/rama/Escritorio/Ledfit/ledfit_back/src/models/Entrenamiento.ts ---
// src/models/Entrenamiento.ts

import mongoose, { Model, Document } from "mongoose";

// Definición del subdocumento para cada ejercicio en un entrenamiento
export interface IEntrenamientoEjercicio {
  ejercicioId: mongoose.Types.ObjectId;
  tiempo: number;
}

export interface IEntrenamiento extends Document {
  nombre: string;
  ejercicios: IEntrenamientoEjercicio[];
  imagen: string;
  tiempoTotal: number;
  grupo: string;
  descripcion: string;
  calorias: number;
}

// Esquema para el subdocumento de ejercicios
const entrenamientoEjercicioSchema = new mongoose.Schema<IEntrenamientoEjercicio>(
  {
    ejercicioId: { type: mongoose.Schema.Types.ObjectId, ref: "Ejercicio", required: true },
    tiempo: { type: Number, required: true }
  },
  { _id: false }
);

// Esquema principal de Entrenamiento
const entrenamientoSchema = new mongoose.Schema<IEntrenamiento>(
  {
    nombre: { type: String, required: true },
    ejercicios: [entrenamientoEjercicioSchema],
    imagen: { type: String, required: true },
    tiempoTotal: { type: Number, required: true },
    grupo: { type: String, required: true },
    descripcion: { type: String, required: true },
    calorias: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

const Entrenamiento: Model<IEntrenamiento> = mongoose.model<IEntrenamiento>(
  "Entrenamiento",
  entrenamientoSchema,
  "entrenamientos"
);
export default Entrenamiento;


// --- Contenido de /home/rama/Escritorio/Ledfit/ledfit_back/src/models/Notification.ts ---
// src/models/Notification.ts

import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  content: string;
  type: "check" | "plus" | "time";
  date: Date;
  read: boolean;
}

const notificationSchema: Schema<INotification> = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    type: { type: String, enum: ["check", "plus", "time"], default: "check" },
    date: { type: Date, default: Date.now },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification: Model<INotification> = mongoose.model<INotification>(
  "Notification",
  notificationSchema
);
export default Notification;


// --- Contenido de /home/rama/Escritorio/Ledfit/ledfit_back/src/models/Ejercicio.ts ---
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEjercicio extends Document {
  _id: mongoose.Types.ObjectId;
  nombre: string;
  imagen: string;
  caloriasPorSegundo: number;
  descripcion: string;
  grupo: string;
}

const ejercicioSchema: Schema<IEjercicio> = new mongoose.Schema(
  {
    descripcion: { type: String, required: true },
    caloriasPorSegundo: { type: Number, required: true },
    imagen: { type: String, required: true },
    nombre: { type: String, required: true },
    grupo: { type: String, required: true }
  },
  { timestamps: true }
);

const Ejercicio: Model<IEjercicio> = mongoose.model<IEjercicio>("Ejercicio", ejercicioSchema, "ejercicios");
export default Ejercicio;


// --- Contenido de /home/rama/Escritorio/Ledfit/ledfit_back/src/middlewares/authMiddleware.ts ---
// src/middlewares/authMiddleware.ts

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import User, { IUser } from "../models/User";

interface JwtPayload {
  id: string;
}

interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export const protect = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        res.status(401).json({ message: "Usuario no encontrado" });
        return;
      }

      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ message: "Token inválido" });
    }
  } else {
    res.status(401).json({ message: "No autorizado, no se proporcionó token" });
  }
};


// --- Contenido de /home/rama/Escritorio/Ledfit/ledfit_back/src/types/express.d.ts ---
// src/types/express.d.ts
import { IUser } from "../models/User";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}


// --- Contenido de /home/rama/Escritorio/Ledfit/ledfit_back/src/controllers/entrenamientosController.ts ---
// src/controllers/entrenamientosController.ts

import { Request, Response } from "express";
import Entrenamiento from "../models/Entrenamiento";

// GET: Listar todos los entrenamientos
export const getAllEntrenamientos = async (req: Request, res: Response) => {
  try {
    const entrenamientos = await Entrenamiento.find({}).populate("ejercicios.ejercicioId");
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

    return res.json(entrenamiento);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener el entrenamiento", error });
  }
};



// --- Contenido de /home/rama/Escritorio/Ledfit/ledfit_back/src/controllers/notificationController.ts ---
// src/controllers/notificationController.ts

import { Request, Response } from "express";
import Notification from "../models/Notification";

// Obtiene las notificaciones del usuario autenticado a partir del token
export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    // Se usa siempre el id obtenido del middleware protect
    const userId = req.user?._id;
    console.log("ID del usuario autenticado:", userId);
    if (!userId) {
      res.status(400).json({ message: "No se encontró el usuario autenticado" });
      return;
    }
    const notifications = await Notification.find({ user: userId }).sort({ date: -1 });
    res.json({ notifications });
    return;
  } catch (error) {
    res.status(500).json({ message: "Error al obtener notificaciones", error });
    return;
  }
};

// Marca una notificación como leída
export const markNotificationAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      res.status(404).json({ message: "Notificación no encontrada" });
      return;
    }
    notification.read = true;
    await notification.save();
    res.json({ message: "Notificación marcada como leída" });
    return;
  } catch (error) {
    res.status(500).json({ message: "Error al marcar notificación como leída", error });
    return;
  }
};

// Crea una notificación para el usuario autenticado (no se envía el id en el body)
export const createNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, message } = req.body; // Se espera title y message en el body
    const userId = req.user?._id; // Se extrae el id del usuario del token
    if (!userId) {
      res.status(400).json({ message: "Usuario no autenticado" });
      return;
    }
    // Se utiliza "content" en lugar de "message" para que coincida con el modelo
    const notification = new Notification({ title, content: message, user: userId });
    await notification.save();
    res.json({ message: "Notificación creada" });
    return;
  } catch (error) {
    res.status(500).json({ message: "Error al crear notificación", error });
    return;
  }
};


// --- Contenido de /home/rama/Escritorio/Ledfit/ledfit_back/src/controllers/ejercicioController.ts ---
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


// --- Contenido de /home/rama/Escritorio/Ledfit/ledfit_back/src/controllers/authController.ts ---
// src/controllers/authController.ts

import { Request, Response } from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

import Notification from "../models/Notification";
import User, { IUser } from "../models/User";

// Extiende la interfaz de Request para incluir `user`
interface AuthenticatedRequest extends Request {
  user?: IUser;
}

// Generar token JWT
const generateToken = (id: mongoose.Types.ObjectId): string => {
    return jwt.sign({ id }, process.env.JWT_SECRET as string, {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    });
  };

// Registro de usuario
export const register = async (req: Request, res: Response): Promise<void> => {
    const { name, email, password } = req.body;
    console.log("Datos recibidos:", { name, email, password });
  
    try {
      const userExists = await User.findOne({ email: email });
      if (userExists) {
        res.status(400).json({ message: "El usuario ya existe" });
        return;
      }

      const user = await User.create({ name, email, password });
      console.log("Usuario creado:", user);
      const token = generateToken(user._id as mongoose.Types.ObjectId);
      console.log("Token generado:", token);
      res.status(201).json({ token, user: { id: user._id, name, email, favs: user.favs } });
    } catch (error) {
      console.error("Error en register:", error);
      res.status(500).json({ message: "Error al registrar usuario" });
    }
  };

// Login de usuario
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: "Credenciales inválidas" });
      return;
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      res.status(400).json({ message: "Credenciales inválidas" });
      return;
    }

    const token = generateToken(user._id as mongoose.Types.ObjectId);

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        favs: user.favs,
        logros: user.logros, // Agregado
        caloriasQuemadas: user.caloriasQuemadas,
        tiempoEntrenado: user.tiempoEntrenado,
        entrenamientosCompletos: user.entrenamientosCompletos,
      },
    });  
  } catch (error) {
    res.status(500).json({ message: "Error al iniciar sesión" });
  }
};

// Obtener perfil del usuario autenticado
export const getUserProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: "No autorizado" });
    return;
  }

  res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    favs: req.user.favs,
    logros: req.user.logros,
    caloriasQuemadas: req.user.caloriasQuemadas,
    tiempoEntrenado: req.user.tiempoEntrenado,
    entrenamientosCompletos: req.user.entrenamientosCompletos
  });
};

// Obtener favoritos del usuario 
export const getFavs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: "Usuario no autenticado" });
    return;
  }
  res.json({ favs: req.user.favs || [] });
};

// Agregar un entrenamiento a favoritos
export const addFav = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: "Usuario no autenticado" });
    return;
  }
  const { entrenamientoId } = req.params;
  try {
    // Evitar duplicados (asumiendo que usas 'favs' en el modelo)
    if (req.user.favs && req.user.favs.includes(new mongoose.Types.ObjectId(entrenamientoId))) {
      res.status(400).json({ message: "El entrenamiento ya está en favoritos" });
      return;
    }
    req.user.favs = req.user.favs || [];
    req.user.favs.push(new mongoose.Types.ObjectId(entrenamientoId));
    await req.user.save();
    res.json({ favs: req.user.favs });
  } catch (error) {
    res.status(500).json({ message: "Error al agregar a favoritos", error });
  }
};

// Eliminar un entrenamiento de favoritos
export const removeFav = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: "Usuario no autenticado" });
    return;
  }
  const { entrenamientoId } = req.params;
  try {
    req.user.favs = (req.user.favs || []).filter(
      (fav) => fav.toString() !== entrenamientoId
    );
    await req.user.save();
    res.json({ favs: req.user.favs });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar de favoritos", error });
  }
};

// Endpoint para actualizar las métricas de la sesión
export const updateMetricas = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "No autorizado" });
      return;
    }

    const { tiempo, calorias } = req.body;

    console.log("Datos recibidos:", { tiempo, calorias });
    req.user.tiempoEntrenado += tiempo; // Actualiza el tiempo entrenado
    req.user.caloriasQuemadas += calorias; // Actualiza las calorías quemadas
    req.user.entrenamientosCompletos += 1; // Actualiza el número de entrenamientos completados

    console.log("Métricas actualizadas:", {
      tiempoEntrenado: req.user.tiempoEntrenado,
      caloriasQuemadas: req.user.caloriasQuemadas,
    });

    // Guarda los cambios en la base de datos
    await req.user.save();

    res.status(200).json({
      message: "Métricas actualizadas correctamente",
      tiempoEntrenado: req.user.tiempoEntrenado,
      caloriasQuemadas: req.user.caloriasQuemadas,
      entrenamientosCompletos: req.user.entrenamientosCompletos,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar métricas", error });
  }
};

// Función para actualizar los logros del usuario y crear notificaciones
export const updateLogros = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "No autorizado" });
      return;
    }

    // Registra el estado actual de los logros del usuario
    console.log("Logros actuales:", req.user.logros);

    const { tiempoEntrenado, caloriasQuemadas, entrenamientosCompletos } = req.user;

    // Guarda una copia de los logros antes de actualizarlos
    const previousLogros = req.user.logros.map((logro) => ({ ...logro }));

    // Actualiza cada logro según su tipo y el umbral
    const updatedLogros = req.user.logros.map((logro) => {
      const threshold = Number(logro.key);
      let obtenido = logro.obtenido; // Conserva el estado actual
      if (logro.type === "time" && tiempoEntrenado >= threshold) {
        obtenido = true;
      } else if (logro.type === "plus" && entrenamientosCompletos >= threshold) {
        obtenido = true;
      } else if (logro.type === "check" && caloriasQuemadas >= threshold) {
        obtenido = true;
      }
      return { ...logro, obtenido };
    });

    console.log("Logros actualizados:", updatedLogros);

    // Procesa cada logro secuencialmente para crear notificaciones
    for (const [index, newLogro] of updatedLogros.entries()) {
      const prevLogro = previousLogros[index];
      if (!prevLogro.obtenido && newLogro.obtenido) {
        const notification = new Notification({
          user: req.user._id,
          title: newLogro.title || "Logro alcanzado",
          // Asigna un valor por defecto si newLogro.content es undefined
          content: newLogro.content || "¡Has alcanzado un nuevo logro!",
          type: newLogro.type,
        });
        try {
          await notification.save();
          console.log(`Notificación guardada para logro: ${newLogro.title}`);
        } catch (notifError) {
          console.error(`Error al guardar la notificación para el logro ${newLogro.title}:`, notifError);
          throw notifError;
        }
      }
    }

    // Actualiza los logros del usuario y guarda en la BD
    req.user.logros = updatedLogros;
    await req.user.save();
    console.log("Usuario actualizado con nuevos logros:", req.user.logros);

    res.status(200).json({ logros: req.user.logros });
    return;
  } catch (error: any) {
    console.error("Error en updateUserLogros:", error);
    res.status(500).json({ message: "Error al actualizar logros", error: error.message });
    return;
  }
};

// --- Contenido de /home/rama/Escritorio/Ledfit/ledfit_back/src/routes/authRoutes.ts ---
import express from "express";

import { 
  register, 
  login, 
  getUserProfile, 
  getFavs, 
  addFav, 
  removeFav, 
  updateMetricas,
  updateLogros
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
router.patch("/update-logros", protect, updateLogros);

export default router;


// --- Contenido de /home/rama/Escritorio/Ledfit/ledfit_back/src/routes/entrenamientosRoutes.ts ---
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


// --- Contenido de /home/rama/Escritorio/Ledfit/ledfit_back/src/routes/ejerciciosRoutes.ts ---
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


// --- Contenido de /home/rama/Escritorio/Ledfit/ledfit_back/src/routes/notificationRoutes.ts ---
// src/routes/notificationRoutes.ts

import express from "express";
import {
  getNotifications,
  markNotificationAsRead,
  createNotification,
} from "../controllers/notificationController";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

// Obtener notificaciones (opcionalmente, se puede pasar un userId en query para pruebas)
router.get("/", protect, getNotifications);

// Marcar una notificación como leída
router.patch("/:notificationId/read", protect, markNotificationAsRead);

// Crear una nueva notificación
router.post("/", protect, createNotification);

export default router;


// --- Contenido de /home/rama/Escritorio/Ledfit/ledfit_back/src/config/db.ts ---
// src/config/db.ts

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("MongoDB conectado");
  } catch (error) {
    console.error("Error al conectar a MongoDB:", error);
    process.exit(1);
  }
};

export default connectDB;


