import express from 'express';
import { updateWorkoutState } from '../controllers/workoutController';
import { protect } from '../middlewares/authMiddleware'; // Import the authentication middleware

const router = express.Router();

// Route to update workout state (pause/resume)
router.route('/state').post(protect, updateWorkoutState); // Apply protect middleware

export default router; 