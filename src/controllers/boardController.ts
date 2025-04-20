import { Response, NextFunction } from "express";
import asyncHandler from 'express-async-handler';
import Board from "../models/Board";
import User from '../models/User';
import mqttClient from '../utils/mqttClient';
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

/**
 * @desc    Get the status of the authenticated user's associated board
 * @route   GET /api/boards/status
 * @access  Private
 */
export const getMyBoardStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
        res.status(401).json({ message: "No autorizado" });
        return;
    }

    if (!req.user.boardId) {
        // It's better to return an empty object or specific status 
        // instead of 404 if the user is valid but just doesn't have a board yet.
        res.status(200).json({ isAssociated: false, message: "Usuario no tiene tablero asociado" });
        return;
    }

    try {
        const board = await Board.findOne({ boardId: req.user.boardId, userId: req.user._id });
        if (!board) {
            // This case might indicate data inconsistency (user has boardId but board doesn't exist or doesn't match userId)
            console.error(`Inconsistency: User ${req.user._id} has boardId ${req.user.boardId}, but Board not found or userId mismatch.`);
            res.status(404).json({ isAssociated: false, message: "Tablero asociado no encontrado o no coincide con el usuario" });
            return;
        }

        // Determine connected status (e.g., based on lastSeen)
        const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
        const isActuallyConnected = board.isConnected && board.lastSeen > twoMinutesAgo;

        res.json({
            isAssociated: true,
            boardId: board.boardId,
            isConnected: isActuallyConnected, // Use the determined status
            lastSeen: board.lastSeen,
        });
    } catch (error) {
        console.error("Error fetching board status:", error);
        res.status(500).json({ message: "Error al obtener estado del tablero" });
    }
});

// @desc    Sincronizar tiempo con el board vía MQTT
// @route   POST /api/boards/sync-time
// @access  Private
export const syncBoardTime = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    // Obtener duración, timestamp y etapa del cuerpo de la petición
    const { duration, clientTimestamp, etapa } = req.body;

    if (!user || !user.boardId) {
        res.status(400); // Bad Request, ya que el usuario debería tener boardId para esta acción
        throw new Error('Usuario no autenticado o sin board vinculado para sincronizar tiempo.');
    }

    if (typeof duration !== 'number' || duration < 0) {
        res.status(400);
        throw new Error('Parámetro "duration" inválido o faltante.');
    }

    // Validar clientTimestamp
    if (typeof clientTimestamp !== 'number') {
        res.status(400);
        throw new Error('Parámetro "clientTimestamp" inválido o faltante.');
    }

    // Validar etapa (Ahora permite INICIO también)
    if (etapa !== 'ACTIVO' && etapa !== 'DESCANSO' && etapa !== 'INICIO') {
        res.status(400);
        throw new Error('Parámetro "etapa" inválido o faltante (debe ser INICIO, ACTIVO o DESCANSO).');
    }

    const boardId = user.boardId;
    const timeSyncTopic = `ledfit/boards/${boardId}/time`;
    // Incluir todo en el payload
    const payload = JSON.stringify({ 
        duration: Math.round(duration), 
        clientTimestamp: clientTimestamp, 
        etapa: etapa // Añadir etapa
    });

    try {
        // Acceder al cliente real y verificar conexión
        if (mqttClient.client && mqttClient.client.connected) {
            // Usar el método publish del cliente real
            // Envolver en Promise para usar async/await con el callback
            await new Promise<void>((resolve, reject) => {
                mqttClient.client?.publish(timeSyncTopic, payload, { qos: 1 }, (error) => { 
                    if (error) {
                        console.error(`[API -> MQTT] Error en callback de publish para ${boardId} (syncTime):`, error);
                        reject(error); // Rechazar la promesa si hay error
                    } else {
                        console.log(`[API -> MQTT] Tiempo sincronizado para ${boardId} en ${timeSyncTopic}: ${payload}`);
                        resolve(); // Resolver la promesa si es exitoso
                    }
                });
            });
            res.status(200).json({ message: 'Tiempo sincronizado con el board.' });
        } else {
            console.error(`[API -> MQTT] Error: Cliente MQTT no conectado o no inicializado. No se pudo sincronizar tiempo para ${boardId}.`);
            res.status(503); // Service Unavailable
            throw new Error('No se pudo comunicar con el servicio de mensajería del board.');
        }
    } catch (error: any) {
        console.error(`[API -> MQTT] Error publicando tiempo para ${boardId}:`, error);
        if (!res.statusCode || res.statusCode < 400) {
             res.status(500);
        }
        // Asegurarse de pasar el error al siguiente middleware de errores
        next(error);
        // throw new Error(error.message || 'Error interno al sincronizar tiempo con el board.'); // Evitar lanzar aquí si usamos next(error)
    }
});

// Add other board-related controller functions here in the future (e.g., associateBoard, etc.) 