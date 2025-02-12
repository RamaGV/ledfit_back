// src/controllers/favsController.ts

import { Request, Response } from "express";
import { Types } from "mongoose";
import User from "../models/User";

// GET: Cargar lista de entrenamientos favoritos
export const getFavs = async (req: Request, res: Response): Promise<void> => {
    if (!req.user){
        res.status(401).json({ message: "No autorizado" });
        return;
    }
    res.json({ favs: req.user.favs || [] });
};

// POST: Agrega un entrenamiento favorito
export const addFav = async (req: Request, res: Response): Promise<void> => {
    if(!req.user){
        res.status(410).json({ message: "Usuario no autorizado"});
        return;
    }

    const { entrenamientoId } = req.params;

    try{
        if (req.user.favs && req.user.favs.includes(new Types.ObjectId(entrenamientoId))) {
            res.status(400).json({ message: "El entrenamiento ya está en favoritos" });
            return;
        }

        req.user.favs = req.user.favs || [];
        req.user.favs.push(new Types.ObjectId(entrenamientoId));
        await req.user.save();
        
        res.json({ favs: req.user.favs});
        } catch(error){
            res.status(500).json({ message: "Error al agregar a favoritos", error });
    }
};

// POST: Elimina un entrenamiento favorito
export const removeFav = async (req: Request, res: Response): Promise<void> => {
    if(!req.user){
        res.status(401).json({ message: "Usuario no autenticado"});
        return;
    }

    const { entrenamientoId } = req.params;

    try{
        req.user.favs = (req.user.favs || []).filter(
            (fav) => fav.toString() !== entrenamientoId
        );
        await req.user.save();
        res.json({ favs: req.user.favs });
    } catch(error){
        res.status(500).json({ message: "Error al eliminar de favoritos", error });
    }
};
