import { Router } from 'express';
import { ShippingController } from '../controllers/shippingController';
import { authenticateToken, requireRole } from '@/shared/middleware/auth';
import { errorHandler } from '@/shared/middleware/errorHandler';
import rateLimit from 'express-rate-limit';

const router = Router();
const shippingController = new ShippingController();

// Rate limiting
const shippingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many shipping requests, please try again later.'
});

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 admin requests per windowMs
  message: 'Too many admin requests, please try again later.'
});

// Public endpoints
router.get('/shipping/tracking/:trackingNumber', shippingLimiter, shippingController.getTrackingInfo.bind(shippingController));
router.post('/shipping/rates', shippingLimiter, shippingController.getShippingRates.bind(shippingController));
router.post('/shipping/validate-address', shippingLimiter, shippingController.validateAddress.bind(shippingController));

// Protected endpoints (require authentication)
router.post('/shipping/shipments', authenticateToken, shippingLimiter, shippingController.createShipment.bind(shippingController));
router.get('/shipping/shipments/:id', authenticateToken, shippingLimiter, shippingController.getShipmentById.bind(shippingController));
router.get('/shipping/shipments', authenticateToken, shippingLimiter, shippingController.getShipments.bind(shippingController));
router.get('/shipping/user/shipments', authenticateToken, shippingLimiter, shippingController.getUserShipments.bind(shippingController));
router.get('/shipping/orders/:orderId/shipments', authenticateToken, shippingLimiter, shippingController.getOrderShipments.bind(shippingController));

// Admin endpoints (require admin role)
router.patch('/shipping/shipments/:id/status', authenticateToken, requireRole('admin'), adminLimiter, shippingController.updateShipmentStatus.bind(shippingController));
router.post('/shipping/shipments/:id/label', authenticateToken, requireRole('admin'), adminLimiter, shippingController.generateLabel.bind(shippingController));
router.get('/shipping/statistics', authenticateToken, requireRole('admin'), adminLimiter, shippingController.getShipmentStatistics.bind(shippingController));

// Error handling middleware
router.use(errorHandler);

export default router; 