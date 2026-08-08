import { Router } from 'express';
import authRoutes from './authRoutes.js';
import habitRoutes from './habitRoutes.js';
import logRoutes from './logRoutes.js';
import statsRoutes from './statsRoutes.js';
import coachRoutes from './coachRoutes.js';
import { coachIsConfigured } from '../services/geminiService.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({
    success: true,
    data: { status: 'ok', coach: coachIsConfigured() ? 'ready' : 'not configured' },
  });
});

router.use('/auth', authRoutes);
router.use('/habits', habitRoutes);
router.use('/logs', logRoutes);
router.use('/stats', statsRoutes);
router.use('/coach', coachRoutes);

export default router;
