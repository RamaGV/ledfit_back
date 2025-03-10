// src/models/Notification.ts

import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  content: string;
  type: "check" | "plus" | "time";
  date: Date;
  read: boolean;
  deleted: boolean;
}

const notificationSchema: Schema<INotification> = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    type: { type: String, enum: ["check", "plus", "time"], default: "check" },
    date: { type: Date, default: Date.now },
    read: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification: Model<INotification> = mongoose.model<INotification>(
  "Notification",
  notificationSchema
);
export default Notification;
