import { Router } from 'express';
import { ProxyService } from '../services/proxyService';
import { AuthMiddleware } from '../middleware/auth';
import { RateLimiterMiddleware } from '../middleware/rateLimiter';
import { UserRole } from '../types';

const router = Router();

// Initialize proxy service
ProxyService.initializeServices();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API Gateway is healthy',
    timestamp: new Date(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API Documentation
router.get('/docs', (req, res) => {
  res.redirect('/api-docs');
});

// Authentication Service Routes
router.use('/auth', 
  RateLimiterMiddleware.authLimiter(),
  ProxyService.createProxy('auth', { '^/auth': '' })
);

// User Service Routes (requires authentication)
router.use('/users', 
  AuthMiddleware.authenticate(),
  RateLimiterMiddleware.apiLimiter(),
  ProxyService.createProxy('user', { '^/users': '' })
);

// Product Service Routes (public read, authenticated write)
router.use('/products', 
  RateLimiterMiddleware.apiLimiter(),
  ProxyService.createProxy('product', { '^/products': '' })
);

// Category Service Routes (public read, admin write)
router.use('/categories', 
  RateLimiterMiddleware.apiLimiter(),
  ProxyService.createProxy('product', { '^/categories': '/categories' })
);

// Order Service Routes (requires authentication)
router.use('/orders', 
  AuthMiddleware.authenticate(),
  RateLimiterMiddleware.apiLimiter(),
  ProxyService.createProxy('order', { '^/orders': '' })
);

// Cart Service Routes (requires authentication)
router.use('/cart', 
  AuthMiddleware.authenticate(),
  RateLimiterMiddleware.apiLimiter(),
  ProxyService.createProxy('order', { '^/cart': '/cart' })
);

// Payment Service Routes (requires authentication)
router.use('/payments', 
  AuthMiddleware.authenticate(),
  RateLimiterMiddleware.apiLimiter(),
  ProxyService.createProxy('payment', { '^/payments': '' })
);

// Notification Service Routes (requires authentication)
router.use('/notifications', 
  AuthMiddleware.authenticate(),
  RateLimiterMiddleware.apiLimiter(),
  ProxyService.createProxy('notification', { '^/notifications': '' })
);

// Review Service Routes (public read, authenticated write)
router.use('/reviews', 
  RateLimiterMiddleware.apiLimiter(),
  ProxyService.createProxy('review', { '^/reviews': '' })
);

// Search Service Routes (public)
router.use('/search', 
  RateLimiterMiddleware.searchLimiter(),
  ProxyService.createProxy('search', { '^/search': '' })
);

// Shipping Service Routes (requires authentication)
router.use('/shipping', 
  AuthMiddleware.authenticate(),
  RateLimiterMiddleware.apiLimiter(),
  ProxyService.createProxy('shipping', { '^/shipping': '' })
);

// Admin Routes (admin only)
router.use('/admin', 
  AuthMiddleware.authenticate(),
  AuthMiddleware.adminOnly(),
  RateLimiterMiddleware.apiLimiter(),
  (req, res, next) => {
    // Route admin requests to appropriate services
    const path = req.path;
    
    if (path.startsWith('/products') || path.startsWith('/categories')) {
      return ProxyService.createProxy('product', { '^/admin': '' })(req, res, next);
    } else if (path.startsWith('/orders')) {
      return ProxyService.createProxy('order', { '^/admin': '' })(req, res, next);
    } else if (path.startsWith('/users')) {
      return ProxyService.createProxy('user', { '^/admin': '' })(req, res, next);
    } else if (path.startsWith('/payments')) {
      return ProxyService.createProxy('payment', { '^/admin': '' })(req, res, next);
    } else if (path.startsWith('/reviews')) {
      return ProxyService.createProxy('review', { '^/admin': '' })(req, res, next);
    } else if (path.startsWith('/shipping')) {
      return ProxyService.createProxy('shipping', { '^/admin': '' })(req, res, next);
    } else {
      return res.status(404).json({
        success: false,
        error: 'Admin endpoint not found',
        timestamp: new Date()
      });
    }
  }
);

// Service Health Check Routes
router.get('/health/services', async (req, res) => {
  const services = ['auth', 'user', 'product', 'order', 'payment', 'notification', 'review', 'search', 'shipping'];
  const healthChecks = await Promise.all(
    services.map(service => ProxyService.checkServiceHealth(service))
  );
  
  res.json({
    success: true,
    data: healthChecks,
    timestamp: new Date()
  });
});

// Service Statistics Routes
router.get('/stats/services', AuthMiddleware.adminOnly(), (req, res) => {
  const services = ['auth', 'user', 'product', 'order', 'payment', 'notification', 'review', 'search', 'shipping'];
  const stats = services.map(service => ProxyService.getServiceStats(service)).filter(Boolean);
  
  res.json({
    success: true,
    data: stats,
    timestamp: new Date()
  });
});

// Circuit Breaker Reset (admin only)
router.post('/admin/circuit-breaker/reset/:service', AuthMiddleware.adminOnly(), (req, res) => {
  const { service } = req.params;
  
  try {
    ProxyService.resetCircuitBreaker(service);
    res.json({
      success: true,
      message: `Circuit breaker reset for service: ${service}`,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: `Failed to reset circuit breaker for service: ${service}`,
      timestamp: new Date()
    });
  }
});

// 404 handler for unmatched routes
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    timestamp: new Date(),
    path: req.originalUrl
  });
});

export default router; 