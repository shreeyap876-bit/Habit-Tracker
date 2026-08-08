import { Router } from 'express';
import {
  getMe,
  googleSignIn,
  login,
  logout,
  register,
  updateMe,
} from '../controllers/authController.js';
import requireAuth from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimit.js';
import {
  googleSignInSchema,
  loginSchema,
  registerSchema,
  updateProfileSchema,
} from './schemas.js';

const router = Router();

// Every credential-accepting route is rate limited: they are cheap to spam and
// expensive to verify.
router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/google', authLimiter, validate(googleSignInSchema), googleSignIn);

router.post('/logout', logout);
router.get('/me', requireAuth, getMe);
router.patch('/me', requireAuth, validate(updateProfileSchema), updateMe);

export default router;
