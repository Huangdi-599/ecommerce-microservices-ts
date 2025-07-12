import { Router } from 'express';
import { PaymentController } from '../controllers/paymentController';
import { authenticateToken } from 'shared-utils';

const router = Router();
const controller = new PaymentController();

// Protected routes (require JWT)
router.post('/intent', authenticateToken, controller.createPaymentIntent);
router.post('/confirm', authenticateToken, controller.confirmPayment);
router.get('/:orderId', authenticateToken, controller.getPaymentByOrderId);

// Webhook route (no authentication required, uses Stripe signature)
router.post('/webhook', controller.handleWebhook);

export default router; 