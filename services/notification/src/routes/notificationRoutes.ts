import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController';
import { authenticateToken } from 'shared-utils';

const router = Router();
const controller = new NotificationController();

// Public routes (for inter-service communication)
router.post('/order-confirmation', controller.sendOrderConfirmation);
router.post('/order-status', controller.sendOrderStatusUpdate);
router.post('/payment-success', controller.sendPaymentSuccessNotification);
router.post('/payment-failed', controller.sendPaymentFailedNotification);

// Protected routes (require JWT)
router.get('/', authenticateToken, controller.getNotifications);
router.put('/:notificationId/read', authenticateToken, controller.markNotificationAsRead);

export default router; 