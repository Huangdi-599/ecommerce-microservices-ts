import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/orderService';

export class OrderController {
  private orderService = new OrderService();

  createOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.userId;
      const { shippingAddress } = req.body;
      
      const order = await this.orderService.createOrder(userId, shippingAddress);
      
      res.status(201).json({
        success: true,
        data: { order },
        message: 'Order created successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  getOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const result = await this.orderService.getOrders(userId, page, limit);
      
      res.json({
        success: true,
        data: { orders: result.orders },
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getOrderById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.userId;
      const { id } = req.params;
      
      const order = await this.orderService.getOrderById(userId, id);
      
      res.json({
        success: true,
        data: { order },
      });
    } catch (error) {
      next(error);
    }
  };

  cancelOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.userId;
      const { id } = req.params;
      
      const order = await this.orderService.cancelOrder(userId, id);
      
      res.json({
        success: true,
        data: { order },
        message: 'Order cancelled successfully',
      });
    } catch (error) {
      next(error);
    }
  };
} 