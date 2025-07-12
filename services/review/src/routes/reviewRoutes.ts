import { Router } from 'express';
import { ReviewController } from '../controllers/reviewController';
import { authenticateToken, requireRole } from '@/shared/middleware/auth';
import { errorHandler } from '@/shared/middleware/errorHandler';
import rateLimit from 'express-rate-limit';

const router = Router();
const reviewController = new ReviewController();

// Rate limiting
const createReviewLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many review creation attempts, please try again later.'
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.'
});

// Public routes
router.get('/reviews', generalLimiter, reviewController.getReviews.bind(reviewController));
router.get('/reviews/:id', generalLimiter, reviewController.getReviewById.bind(reviewController));
router.get('/reviews/product/:productId', generalLimiter, reviewController.getProductReviews.bind(reviewController));
router.get('/reviews/product/:productId/rating', generalLimiter, reviewController.getAverageRating.bind(reviewController));
router.get('/reviews/product/:productId/distribution', generalLimiter, reviewController.getRatingDistribution.bind(reviewController));

// Protected routes (require authentication)
router.post('/reviews', authenticateToken, createReviewLimiter, reviewController.createReview.bind(reviewController));
router.put('/reviews/:id', authenticateToken, generalLimiter, reviewController.updateReview.bind(reviewController));
router.delete('/reviews/:id', authenticateToken, generalLimiter, reviewController.deleteReview.bind(reviewController));
router.post('/reviews/:id/helpful', authenticateToken, generalLimiter, reviewController.markHelpful.bind(reviewController));
router.get('/reviews/user/me', authenticateToken, generalLimiter, reviewController.getUserReviews.bind(reviewController));

// Admin routes (require admin role)
router.patch('/reviews/:id/status', authenticateToken, requireRole('admin'), generalLimiter, reviewController.updateReviewStatus.bind(reviewController));
router.patch('/reviews/:id/verified', authenticateToken, requireRole('admin'), generalLimiter, reviewController.markVerified.bind(reviewController));

// Error handling middleware
router.use(errorHandler);

export default router; 