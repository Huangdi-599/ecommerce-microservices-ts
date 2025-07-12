import { Router } from 'express';
import { SearchController } from '../controllers/searchController';
import { authenticateToken, requireRole } from '@/shared/middleware/auth';
import { errorHandler } from '@/shared/middleware/errorHandler';
import rateLimit from 'express-rate-limit';

const router = Router();
const searchController = new SearchController();

// Rate limiting
const searchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: 'Too many search requests, please try again later.'
});

const indexingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 indexing requests per windowMs
  message: 'Too many indexing requests, please try again later.'
});

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 admin requests per windowMs
  message: 'Too many admin requests, please try again later.'
});

// Public search endpoints
router.get('/search/products', searchLimiter, searchController.searchProducts.bind(searchController));
router.get('/search/categories', searchLimiter, searchController.searchCategories.bind(searchController));
router.get('/search/suggestions', searchLimiter, searchController.getSuggestions.bind(searchController));
router.get('/search/health', searchController.healthCheck.bind(searchController));

// Protected indexing endpoints (require authentication)
router.post('/search/index', authenticateToken, indexingLimiter, searchController.indexDocument.bind(searchController));
router.post('/search/bulk-index', authenticateToken, indexingLimiter, searchController.bulkIndexDocuments.bind(searchController));
router.put('/search/index/:type/:id', authenticateToken, indexingLimiter, searchController.updateDocument.bind(searchController));
router.delete('/search/index/:type/:id', authenticateToken, indexingLimiter, searchController.removeDocument.bind(searchController));

// Admin endpoints (require admin role)
router.get('/search/status', authenticateToken, requireRole('admin'), adminLimiter, searchController.getIndexingStatus.bind(searchController));
router.post('/search/reindex/:service/:type', authenticateToken, requireRole('admin'), adminLimiter, searchController.reindexService.bind(searchController));
router.get('/search/stats', authenticateToken, requireRole('admin'), adminLimiter, searchController.getSearchStats.bind(searchController));

// Error handling middleware
router.use(errorHandler);

export default router; 