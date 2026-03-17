import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { myTasksAssistant, taskDetailAssistant, textToSpeech, getTaskInsights, getStoredTaskInsights } from '../controllers/aiController.js';

const router = express.Router();

router.use(authMiddleware); 

router.post('/my-tasks', myTasksAssistant);
router.post('/task-detail', taskDetailAssistant);
router.post('/tts', textToSpeech);
router.post('/task-insights', getTaskInsights);
router.get('/task-insights/:taskId', getStoredTaskInsights);

export default router;
