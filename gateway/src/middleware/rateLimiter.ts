import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import { Request, Response } from 'express';

export class RateLimiterMiddleware {
  /**
   * Global rate limiter for all requests
   */
  static globalLimiter() {
    return rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
      message: {
        success: false,
        error: 'Too many requests from this IP, please try again later.',
        timestamp: new Date()
      },
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req: Request, res: Response) => {
        res.status(429).json({
          success: false,
          error: 'Too many requests from this IP, please try again later.',
          timestamp: new Date()
        });
      }
    });
  }

  /**
   * Strict rate limiter for authentication endpoints
   */
  static authLimiter() {
    return rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // limit each IP to 5 requests per windowMs
      message: {
        success: false,
        error: 'Too many authentication attempts, please try again later.',
        timestamp: new Date()
      },
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req: Request, res: Response) => {
        res.status(429).json({
          success: false,
          error: 'Too many authentication attempts, please try again later.',
          timestamp: new Date()
        });
      }
    });
  }

  /**
   * API rate limiter for authenticated users
   */
  static apiLimiter() {
    return rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // limit each IP to 1000 requests per windowMs
      message: {
        success: false,
        error: 'API rate limit exceeded, please try again later.',
        timestamp: new Date()
      },
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req: Request, res: Response) => {
        res.status(429).json({
          success: false,
          error: 'API rate limit exceeded, please try again later.',
          timestamp: new Date()
        });
      }
    });
  }

  /**
   * Slow down middleware for gradual response delay
   */
  static slowDown() {
    return slowDown({
      windowMs: parseInt(process.env.SLOW_DOWN_WINDOW_MS || '900000'), // 15 minutes
      delayAfter: parseInt(process.env.SLOW_DOWN_DELAY_AFTER || '50'), // allow 50 requests per 15 minutes, then...
      delayMs: (hits: number) => Math.min(hits * 100, parseInt(process.env.SLOW_DOWN_MAX_DELAY || '200')), // begin adding 100ms of delay per request above 50
      handler: (req: Request, res: Response) => {
        res.status(429).json({
          success: false,
          error: 'Too many requests, please slow down.',
          timestamp: new Date()
        });
      }
    });
  }

  /**
   * Custom rate limiter for specific endpoints
   */
  static customLimiter(options: {
    windowMs: number;
    max: number;
    message: string;
    skipSuccessfulRequests?: boolean;
    skipFailedRequests?: boolean;
  }) {
    return rateLimit({
      windowMs: options.windowMs,
      max: options.max,
      message: {
        success: false,
        error: options.message,
        timestamp: new Date()
      },
      standardHeaders: true,
      legacyHeaders: false,
      skipSuccessfulRequests: options.skipSuccessfulRequests || false,
      skipFailedRequests: options.skipFailedRequests || false,
      handler: (req: Request, res: Response) => {
        res.status(429).json({
          success: false,
          error: options.message,
          timestamp: new Date()
        });
      }
    });
  }

  /**
   * Rate limiter for file uploads
   */
  static uploadLimiter() {
    return rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 10, // limit each IP to 10 uploads per hour
      message: {
        success: false,
        error: 'Too many file uploads, please try again later.',
        timestamp: new Date()
      },
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req: Request, res: Response) => {
        res.status(429).json({
          success: false,
          error: 'Too many file uploads, please try again later.',
          timestamp: new Date()
        });
      }
    });
  }

  /**
   * Rate limiter for search endpoints
   */
  static searchLimiter() {
    return rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: 30, // limit each IP to 30 searches per minute
      message: {
        success: false,
        error: 'Too many search requests, please try again later.',
        timestamp: new Date()
      },
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req: Request, res: Response) => {
        res.status(429).json({
          success: false,
          error: 'Too many search requests, please try again later.',
          timestamp: new Date()
        });
      }
    });
  }
} 