import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { myTasksAssistant, taskDetailAssistant, textToSpeech } from '../controllers/aiController.js';

const router = express.Router();

router.use(authMiddleware); 

router.post('/my-tasks', myTasksAssistant);
router.post('/task-detail', taskDetailAssistant);
router.post('/tts', textToSpeech);

export default router;
