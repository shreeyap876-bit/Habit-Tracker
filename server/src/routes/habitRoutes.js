import { Router } from 'express';
import {
  createHabit,
  deleteHabit,
  getHabit,
  listHabits,
  updateHabit,
} from '../controllers/habitController.js';
import requireAuth from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import {
  createHabitSchema,
  habitParamsSchema,
  listHabitsSchema,
  updateHabitSchema,
} from './schemas.js';

const router = Router();

router.use(requireAuth);

router.get('/', validate(listHabitsSchema, 'query'), listHabits);
router.post('/', validate(createHabitSchema), createHabit);
router.get('/:id', validate(habitParamsSchema, 'params'), getHabit);
router.patch('/:id', validate(habitParamsSchema, 'params'), validate(updateHabitSchema), updateHabit);
router.delete('/:id', validate(habitParamsSchema, 'params'), deleteHabit);

export default router;
