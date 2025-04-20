import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User';
import mqttClient from '../utils/mqttClient';
import { AuthenticatedRequest } from '../middlewares/authMiddleware'; // Assuming this interface exists

/**
 * @desc    Update workout state (pause/resume) and notify board via MQTT
 * @route   POST /api/workout/state
 * @access  Private
 */
const updateWorkoutState = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  // Expecting { paused: true/false, clientTimestamp: 1234567890 }
  const { paused, clientTimestamp } = req.body; 
  const userId = req.user?._id; // Assumes authMiddleware adds user to req

  if (typeof paused !== 'boolean') {
    res.status(400).json({ message: 'Invalid payload: paused state (boolean) is required' });
    return;
  }

  // Validate clientTimestamp
  if (typeof clientTimestamp !== 'number') {
    res.status(400).json({ message: 'Invalid payload: clientTimestamp (number) is required' });
    return;
  }

  if (!userId) {
     res.status(401).json({ message: 'Not authorized, user not found' });
     return;
  }

  const user = await User.findById(userId);

  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  // Update user's pause state in DB
  user.isPaused = paused;
  await user.save();

  // Check if user has an associated board
  if (!user.boardId) {
    console.warn(`User ${userId} updated pause state to ${paused}, but has no associated boardId.`);
    // Still send success response to the app, but log the warning
    res.status(200).json({ message: `State updated to ${paused ? 'paused' : 'resumed'}. No board associated.` });
    return;
  }

  // Publish command to MQTT
  const command = paused ? 'pause' : 'resume';
  try {
    // Pasar clientTimestamp a publishCommand
    await mqttClient.publishCommand(user.boardId, command, clientTimestamp);
    res.status(200).json({ message: `State updated to ${command} and command sent to board ${user.boardId}` });
  } catch (error: any) {
    console.error(`Failed to publish MQTT command for user ${userId}, board ${user.boardId}:`, error);
    // Decide if the API call should fail if MQTT fails
    // Option 1: Still succeed, but log error (as the DB state was updated)
    res.status(200).json({ message: `State updated to ${command} in DB, but failed to send command to board.`, error: error.message });
    // Option 2: Return server error
    // res.status(500).json({ message: 'Failed to send command to board via MQTT', error: error.message });
  }
});

export {
  updateWorkoutState,
}; 