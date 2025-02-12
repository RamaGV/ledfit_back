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
