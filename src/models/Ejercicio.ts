import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEjercicio extends Document {
  _id: mongoose.Types.ObjectId;
  nombre: string;
  imagen: string;
  calorias: number;
  descripcion: string;
  grupo: string;
}

const ejercicioSchema: Schema<IEjercicio> = new mongoose.Schema(
  {
    descripcion: { type: String, required: true },
    calorias: { type: Number, required: true },
    imagen: { type: String, required: true },
    nombre: { type: String, required: true },
    grupo: { type: String, required: true }
  },
  { timestamps: true }
);

const Ejercicio: Model<IEjercicio> = mongoose.model<IEjercicio>("Ejercicio", ejercicioSchema, "ejercicios");
export default Ejercicio;
