import { Request, Response, NextFunction } from 'express';

// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
  MODERATOR = 'moderator'
}

// JWT types
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// Service configuration
export interface ServiceConfig {
  name: string;
  url: string;
  timeout: number;
  circuitBreaker: CircuitBreakerConfig;
}

export interface CircuitBreakerConfig {
  timeout: number;
  errorThresholdPercentage: number;
  volumeThreshold: number;
}

// Rate limiting
export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message: string;
}

// Request/Response types
export interface AuthenticatedRequest extends Request {
  user?: User;
  token?: string;
}

export interface GatewayResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: Date;
}

// Error types
export interface GatewayError extends Error {
  statusCode: number;
  isOperational: boolean;
}

// Logging
export interface LogEntry {
  timestamp: Date;
  level: string;
  message: string;
  service: string;
  userId?: string;
  requestId?: string;
  metadata?: Record<string, any>;
}

// Metrics
export interface ServiceMetrics {
  service: string;
  requests: number;
  errors: number;
  responseTime: number;
  circuitBreakerState: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
}

// Cache
export interface CacheConfig {
  ttl: number;
  maxSize: number;
  checkPeriod: number;
}

// API Documentation
export interface SwaggerConfig {
  title: string;
  description: string;
  version: string;
  servers: Array<{
    url: string;
    description: string;
  }>;
}

// Middleware types
export type MiddlewareFunction = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

// Proxy configuration
export interface ProxyConfig {
  target: string;
  changeOrigin: boolean;
  pathRewrite?: Record<string, string>;
  onProxyReq?: (proxyReq: any, req: Request, res: Response) => void;
  onProxyRes?: (proxyRes: any, req: Request, res: Response) => void;
  onError?: (err: Error, req: Request, res: Response) => void;
}

// Health check
export interface HealthCheck {
  service: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime: number;
  lastCheck: Date;
  error?: string;
}

// Service discovery
export interface ServiceRegistry {
  name: string;
  url: string;
  health: HealthCheck;
  metadata?: Record<string, any>;
} 