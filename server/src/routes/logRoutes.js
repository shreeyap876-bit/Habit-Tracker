import { Router } from 'express';
import { listLogs, toggleLog } from '../controllers/logController.js';
import requireAuth from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { listLogsSchema, toggleLogSchema } from './schemas.js';

const router = Router();

router.use(requireAuth);

router.get('/', validate(listLogsSchema, 'query'), listLogs);
router.post('/toggle', validate(toggleLogSchema), toggleLog);

export default router;
