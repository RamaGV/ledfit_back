// src/models/Entrenamiento.ts

import mongoose, { Model } from "mongoose";

import type { IEjercicio } from "./Ejercicio";


export interface IEntrenamiento {
  _id: mongoose.Types.ObjectId;
  nombre: string;
  ejercicios: IEjercicio[];
  imagen: string;
  tiempoTotal: number;
  grupo: string;
  descripcion: string; 
}

const entrenamientoSchema = new mongoose.Schema<IEntrenamiento>(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, required: true },
    nombre: { type: String, required: true },
    ejercicios: [
      { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ejercicio",
      }
    ],
    imagen: { type: String, required: true },
    tiempoTotal: { type: Number, required: true },
    grupo: { type: String, required: true },
    descripcion: { type: String, required: true },
  },
  { timestamps: true }
);

const Entrenamiento: Model<IEntrenamiento> = mongoose.model<IEntrenamiento>("Entrenamiento", entrenamientoSchema, "entrenamientos");
export default Entrenamiento;
