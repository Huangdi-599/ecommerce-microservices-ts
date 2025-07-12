import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, JWTPayload, User, UserRole } from '../types';

export interface AuthOptions {
  required?: boolean;
  roles?: UserRole[];
}

export class AuthMiddleware {
  private static jwtSecret = process.env.JWT_SECRET || 'fallback-secret';

  /**
   * Verify JWT token and extract user information
   */
  static verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.jwtSecret) as JWTPayload;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  /**
   * Extract token from request headers
   */
  static extractToken(req: Request): string | null {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }

  /**
   * Main authentication middleware
   */
  static authenticate(options: AuthOptions = { required: true }): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) => {
      const authReq = req as AuthenticatedRequest;
      
      try {
        const token = this.extractToken(req);
        
        if (!token) {
          if (options.required) {
            return res.status(401).json({
              success: false,
              error: 'Access token required',
              timestamp: new Date()
            });
          }
          return next();
        }

        const payload = this.verifyToken(token);
        
        // Create user object from JWT payload
        const user: User = {
          id: payload.userId,
          email: payload.email,
          firstName: '', // These would be populated from user service if needed
          lastName: '',
          role: payload.role,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        authReq.user = user;
        authReq.token = token;
        
        next();
      } catch (error) {
        if (options.required) {
          return res.status(401).json({
            success: false,
            error: 'Invalid or expired token',
            timestamp: new Date()
          });
        }
        next();
      }
    };
  }

  /**
   * Role-based authorization middleware
   */
  static authorize(roles: UserRole[]): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) => {
      const authReq = req as AuthenticatedRequest;
      
      if (!authReq.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          timestamp: new Date()
        });
      }

      if (!roles.includes(authReq.user.role)) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions',
          timestamp: new Date()
        });
      }

      next();
    };
  }

  /**
   * Optional authentication middleware
   */
  static optionalAuth(): (req: Request, res: Response, next: NextFunction) => void {
    return this.authenticate({ required: false });
  }

  /**
   * Admin-only authorization
   */
  static adminOnly(): (req: Request, res: Response, next: NextFunction) => void {
    return this.authorize([UserRole.ADMIN]);
  }

  /**
   * Customer-only authorization
   */
  static customerOnly(): (req: Request, res: Response, next: NextFunction) => void {
    return this.authorize([UserRole.CUSTOMER]);
  }

  /**
   * Admin or moderator authorization
   */
  static adminOrModerator(): (req: Request, res: Response, next: NextFunction) => void {
    return this.authorize([UserRole.ADMIN, UserRole.MODERATOR]);
  }
} 