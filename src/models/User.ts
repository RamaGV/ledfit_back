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
  oauthProvider?: string; // 'google', 'facebook', 'apple'
  oauthId?: string;       // ID único del proveedor
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
    entrenamientosCompletos: { type: Number, default: 0 },
    oauthProvider: { type: String, enum: ['google', 'facebook', 'apple'], required: false },
    oauthId: { type: String, required: false }
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
