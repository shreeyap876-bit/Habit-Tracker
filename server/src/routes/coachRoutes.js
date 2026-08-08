import { Router } from 'express';
import {
  clearHistory,
  getHistory,
  getTip,
  sendMessage,
} from '../controllers/coachController.js';
import requireAuth from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { coachLimiter } from '../middleware/rateLimit.js';
import { chatSchema, tipSchema } from './schemas.js';

const router = Router();

router.use(requireAuth);

router.get('/history', getHistory);
router.delete('/history', clearHistory);
router.post('/chat', coachLimiter, validate(chatSchema), sendMessage);
router.get('/tip', coachLimiter, validate(tipSchema, 'query'), getTip);

export default router;
