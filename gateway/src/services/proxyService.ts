import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import { Request, Response } from 'express';
import CircuitBreaker from 'circuit-breaker-js';
import axios from 'axios';
import { ServiceConfig, CircuitBreakerConfig, HealthCheck } from '../types';

export class ProxyService {
  private static circuitBreakers = new Map<string, CircuitBreaker>();
  private static serviceConfigs = new Map<string, ServiceConfig>();

  /**
   * Initialize service configurations
   */
  static initializeServices(): void {
    const services: ServiceConfig[] = [
      {
        name: 'auth',
        url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
        timeout: 5000,
        circuitBreaker: {
          timeout: parseInt(process.env.CIRCUIT_BREAKER_TIMEOUT || '3000'),
          errorThresholdPercentage: parseInt(process.env.CIRCUIT_BREAKER_ERROR_THRESHOLD_PERCENTAGE || '50'),
          volumeThreshold: parseInt(process.env.CIRCUIT_BREAKER_VOLUME_THRESHOLD || '10')
        }
      },
      {
        name: 'user',
        url: process.env.USER_SERVICE_URL || 'http://localhost:3002',
        timeout: 5000,
        circuitBreaker: {
          timeout: parseInt(process.env.CIRCUIT_BREAKER_TIMEOUT || '3000'),
          errorThresholdPercentage: parseInt(process.env.CIRCUIT_BREAKER_ERROR_THRESHOLD_PERCENTAGE || '50'),
          volumeThreshold: parseInt(process.env.CIRCUIT_BREAKER_VOLUME_THRESHOLD || '10')
        }
      },
      {
        name: 'product',
        url: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3003',
        timeout: 5000,
        circuitBreaker: {
          timeout: parseInt(process.env.CIRCUIT_BREAKER_TIMEOUT || '3000'),
          errorThresholdPercentage: parseInt(process.env.CIRCUIT_BREAKER_ERROR_THRESHOLD_PERCENTAGE || '50'),
          volumeThreshold: parseInt(process.env.CIRCUIT_BREAKER_VOLUME_THRESHOLD || '10')
        }
      },
      {
        name: 'order',
        url: process.env.ORDER_SERVICE_URL || 'http://localhost:3004',
        timeout: 5000,
        circuitBreaker: {
          timeout: parseInt(process.env.CIRCUIT_BREAKER_TIMEOUT || '3000'),
          errorThresholdPercentage: parseInt(process.env.CIRCUIT_BREAKER_ERROR_THRESHOLD_PERCENTAGE || '50'),
          volumeThreshold: parseInt(process.env.CIRCUIT_BREAKER_VOLUME_THRESHOLD || '10')
        }
      },
      {
        name: 'payment',
        url: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3005',
        timeout: 5000,
        circuitBreaker: {
          timeout: parseInt(process.env.CIRCUIT_BREAKER_TIMEOUT || '3000'),
          errorThresholdPercentage: parseInt(process.env.CIRCUIT_BREAKER_ERROR_THRESHOLD_PERCENTAGE || '50'),
          volumeThreshold: parseInt(process.env.CIRCUIT_BREAKER_VOLUME_THRESHOLD || '10')
        }
      },
      {
        name: 'notification',
        url: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3006',
        timeout: 5000,
        circuitBreaker: {
          timeout: parseInt(process.env.CIRCUIT_BREAKER_TIMEOUT || '3000'),
          errorThresholdPercentage: parseInt(process.env.CIRCUIT_BREAKER_ERROR_THRESHOLD_PERCENTAGE || '50'),
          volumeThreshold: parseInt(process.env.CIRCUIT_BREAKER_VOLUME_THRESHOLD || '10')
        }
      },
      {
        name: 'review',
        url: process.env.REVIEW_SERVICE_URL || 'http://localhost:3007',
        timeout: 5000,
        circuitBreaker: {
          timeout: parseInt(process.env.CIRCUIT_BREAKER_TIMEOUT || '3000'),
          errorThresholdPercentage: parseInt(process.env.CIRCUIT_BREAKER_ERROR_THRESHOLD_PERCENTAGE || '50'),
          volumeThreshold: parseInt(process.env.CIRCUIT_BREAKER_VOLUME_THRESHOLD || '10')
        }
      },
      {
        name: 'search',
        url: process.env.SEARCH_SERVICE_URL || 'http://localhost:3008',
        timeout: 5000,
        circuitBreaker: {
          timeout: parseInt(process.env.CIRCUIT_BREAKER_TIMEOUT || '3000'),
          errorThresholdPercentage: parseInt(process.env.CIRCUIT_BREAKER_ERROR_THRESHOLD_PERCENTAGE || '50'),
          volumeThreshold: parseInt(process.env.CIRCUIT_BREAKER_VOLUME_THRESHOLD || '10')
        }
      },
      {
        name: 'shipping',
        url: process.env.SHIPPING_SERVICE_URL || 'http://localhost:3009',
        timeout: 5000,
        circuitBreaker: {
          timeout: parseInt(process.env.CIRCUIT_BREAKER_TIMEOUT || '3000'),
          errorThresholdPercentage: parseInt(process.env.CIRCUIT_BREAKER_ERROR_THRESHOLD_PERCENTAGE || '50'),
          volumeThreshold: parseInt(process.env.CIRCUIT_BREAKER_VOLUME_THRESHOLD || '10')
        }
      }
    ];

    services.forEach(service => {
      this.serviceConfigs.set(service.name, service);
      this.initializeCircuitBreaker(service);
    });
  }

  /**
   * Initialize circuit breaker for a service
   */
  private static initializeCircuitBreaker(service: ServiceConfig): void {
    const circuitBreaker = new CircuitBreaker({
      timeoutDuration: service.circuitBreaker.timeout,
      errorThresholdPercentage: service.circuitBreaker.errorThresholdPercentage,
      volumeThreshold: service.circuitBreaker.volumeThreshold
    });

    this.circuitBreakers.set(service.name, circuitBreaker);
  }

  /**
   * Create proxy middleware for a service
   */
  static createProxy(serviceName: string, pathRewrite?: Record<string, string>): any {
    const service = this.serviceConfigs.get(serviceName);
    if (!service) {
      throw new Error(`Service ${serviceName} not found`);
    }

    const options: Options = {
      target: service.url,
      changeOrigin: true,
      timeout: service.timeout,
      pathRewrite,
      onProxyReq: (proxyReq, req, res) => {
        // Add request ID for tracing
        const requestId = req.headers['x-request-id'] || this.generateRequestId();
        proxyReq.setHeader('x-request-id', requestId);
        
        // Add user information if available
        if ((req as any).user) {
          proxyReq.setHeader('x-user-id', (req as any).user.id);
          proxyReq.setHeader('x-user-role', (req as any).user.role);
        }

        console.log(`[${serviceName}] Proxying request to ${proxyReq.path}`);
      },
      onProxyRes: (proxyRes, req, res) => {
        console.log(`[${serviceName}] Response status: ${proxyRes.statusCode}`);
      },
      onError: (err, req, res) => {
        console.error(`[${serviceName}] Proxy error:`, err.message);
        
        const circuitBreaker = this.circuitBreakers.get(serviceName);
        if (circuitBreaker) {
          circuitBreaker.fail();
        }

        res.status(503).json({
          success: false,
          error: `Service ${serviceName} is temporarily unavailable`,
          timestamp: new Date()
        });
      }
    };

    return createProxyMiddleware(options);
  }

  /**
   * Check service health
   */
  static async checkServiceHealth(serviceName: string): Promise<HealthCheck> {
    const service = this.serviceConfigs.get(serviceName);
    if (!service) {
      return {
        service: serviceName,
        status: 'unhealthy',
        responseTime: 0,
        lastCheck: new Date(),
        error: 'Service not configured'
      };
    }

    const startTime = Date.now();
    
    try {
      const response = await axios.get(`${service.url}/health`, {
        timeout: service.timeout
      });
      
      const responseTime = Date.now() - startTime;
      
      return {
        service: serviceName,
        status: response.status === 200 ? 'healthy' : 'degraded',
        responseTime,
        lastCheck: new Date()
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        service: serviceName,
        status: 'unhealthy',
        responseTime,
        lastCheck: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get circuit breaker state for a service
   */
  static getCircuitBreakerState(serviceName: string): string {
    const circuitBreaker = this.circuitBreakers.get(serviceName);
    if (!circuitBreaker) {
      return 'UNKNOWN';
    }

    if (circuitBreaker.isOpen()) {
      return 'OPEN';
    } else if (circuitBreaker.isHalfOpen()) {
      return 'HALF_OPEN';
    } else {
      return 'CLOSED';
    }
  }

  /**
   * Get all service configurations
   */
  static getServiceConfigs(): Map<string, ServiceConfig> {
    return this.serviceConfigs;
  }

  /**
   * Generate unique request ID
   */
  private static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Reset circuit breaker for a service
   */
  static resetCircuitBreaker(serviceName: string): void {
    const circuitBreaker = this.circuitBreakers.get(serviceName);
    if (circuitBreaker) {
      circuitBreaker.reset();
    }
  }

  /**
   * Get service statistics
   */
  static getServiceStats(serviceName: string) {
    const circuitBreaker = this.circuitBreakers.get(serviceName);
    const service = this.serviceConfigs.get(serviceName);
    
    if (!circuitBreaker || !service) {
      return null;
    }

    return {
      service: serviceName,
      url: service.url,
      circuitBreakerState: this.getCircuitBreakerState(serviceName),
      timeout: service.timeout,
      errorThresholdPercentage: service.circuitBreaker.errorThresholdPercentage,
      volumeThreshold: service.circuitBreaker.volumeThreshold
    };
  }
} 