import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticateToken } from 'shared-utils';

const router = Router();
const controller = new UserController();

// All routes require authentication
router.use(authenticateToken);

// Profile
router.get('/profile', controller.getProfile);
router.put('/profile', controller.updateProfile);

// Addresses
router.get('/addresses', controller.listAddresses);
router.post('/addresses', controller.addAddress);
router.put('/addresses/:id', controller.updateAddress);
router.delete('/addresses/:id', controller.deleteAddress);

// Preferences
router.get('/preferences', controller.getPreferences);
router.put('/preferences', controller.updatePreferences);

export default router; 