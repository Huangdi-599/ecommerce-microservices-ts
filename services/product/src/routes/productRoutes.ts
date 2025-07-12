import { Router } from 'express';
import multer from 'multer';
import { ProductController } from '../controllers/productController';
import { authenticateToken, requireAdmin, requireUser } from 'shared-utils';
import { validateRequest, productSchema } from 'shared-utils';

const router = Router();
const controller = new ProductController();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Public routes (read-only)
router.get('/', controller.getProducts);
router.get('/search', controller.searchProducts);
router.get('/category/:categoryId', controller.getProductsByCategory);
router.get('/:id', controller.getProductById);

// Protected routes (admin only for write operations)
router.post('/', authenticateToken, requireAdmin, validateRequest(productSchema), controller.createProduct);
router.put('/:id', authenticateToken, requireAdmin, validateRequest(productSchema), controller.updateProduct);
router.delete('/:id', authenticateToken, requireAdmin, controller.deleteProduct);

// Image upload routes (admin only)
router.post('/:id/images', authenticateToken, requireAdmin, upload.array('images', 5), controller.uploadProductImages);
router.delete('/:id/images', authenticateToken, requireAdmin, controller.deleteProductImage);

export default router; 