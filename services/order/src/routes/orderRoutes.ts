import { Router } from 'express';
import { OrderController } from '../controllers/orderController';
import { authenticateToken } from 'shared-utils';

const router = Router();
const controller = new OrderController();

// All order routes require authentication
router.use(authenticateToken);

router.get('/', controller.getOrders);
router.post('/', controller.createOrder);
router.get('/:id', controller.getOrderById);
router.put('/:id/cancel', controller.cancelOrder);

export default router; 