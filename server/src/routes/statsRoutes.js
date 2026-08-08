import { Router } from 'express';
import { heatmap, overview } from '../controllers/statsController.js';
import requireAuth from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { heatmapSchema, overviewSchema } from './schemas.js';

const router = Router();

router.use(requireAuth);

router.get('/overview', validate(overviewSchema, 'query'), overview);
router.get('/heatmap', validate(heatmapSchema, 'query'), heatmap);

export default router;
