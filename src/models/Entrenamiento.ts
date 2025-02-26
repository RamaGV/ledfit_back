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
