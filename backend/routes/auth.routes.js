import express from 'express';
import rateLimit from 'express-rate-limit';
import authController from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import requireRoles from '../middleware/requireRoles.js';

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { mensaje: 'Demasiados intentos de login. Intenta de nuevo en 15 minutos.' },
});

const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { mensaje: 'Demasiados intentos de registro. Intenta de nuevo en 1 hora.' },
});

router.post(
  '/signup',
  signupLimiter,
  authMiddleware,
  requireRoles(['admin']),
  authController.signup,
);
router.post('/login', loginLimiter, authController.login);

export default router;
