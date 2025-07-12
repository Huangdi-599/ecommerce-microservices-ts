import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { validateRequest, userSchema, loginSchema, authenticateToken } from 'shared-utils';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/signup', validateRequest(userSchema), authController.signup);
router.post('/login', validateRequest(loginSchema), authController.login);
router.post('/refresh', authController.refreshToken);

// Protected routes
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, authController.updateProfile);

export default router; 