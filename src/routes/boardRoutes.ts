// src/routes/boardRoutes.ts
import express from 'express';
import { getMyBoardStatus, syncBoardTime } from '../controllers/boardController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

// Route to get the authenticated user's board status
router.route('/status').get(protect, getMyBoardStatus);

// Nueva ruta para sincronizar el tiempo
router.post('/sync-time', protect, syncBoardTime);

// Add other board-related routes here in the future

export default router; 