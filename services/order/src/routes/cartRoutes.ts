import { Router } from 'express';
import { CartController } from '../controllers/cartController';
import { authenticateToken } from 'shared-utils';

const router = Router();
const controller = new CartController();

// All cart routes require authentication
router.use(authenticateToken);

router.get('/', controller.getCart);
router.post('/', controller.addToCart);
router.put('/:itemId', controller.updateCartItem);
router.delete('/:itemId', controller.removeFromCart);
router.delete('/', controller.clearCart);
router.get('/total', controller.getCartTotal);

export default router; 