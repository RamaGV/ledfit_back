import mongoose, { Schema, Document, Model } from "mongoose";

// Interface for the Board document
export interface IBoard extends Document {
  boardId: string; // Unique identifier for the physical or simulated board
  userId: mongoose.Types.ObjectId; // Reference to the User who owns/uses this board
  isConnected: boolean; // Current connection status
  lastSeen: Date; // Timestamp of the last message/heartbeat received
  // You could add other fields like firmware version, etc.
}

// Mongoose Schema for Board
const boardSchema: Schema<IBoard> = new mongoose.Schema(
  {
    boardId: { 
      type: String, 
      required: true, 
      unique: true // Each board must have a unique ID
    },
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", // Creates a link to the User model
      required: true,
      unique: true // Assuming one board per user for now
    },
    isConnected: { 
      type: Boolean, 
      default: false // Default to disconnected
    },
    lastSeen: { 
      type: Date, 
      default: Date.now // Set initial lastSeen to now
    }
  },
  { timestamps: true } // Adds createdAt and updatedAt automatically
);

// Create and export the Board model
const Board: Model<IBoard> = mongoose.model<IBoard>("Board", boardSchema);
export default Board; 