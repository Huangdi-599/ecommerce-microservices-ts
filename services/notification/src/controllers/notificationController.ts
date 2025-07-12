import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notificationService';

export class NotificationController {
  private notificationService = new NotificationService();

  sendOrderConfirmation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, userEmail, orderData } = req.body;
      
      const notification = await this.notificationService.sendOrderConfirmation(
        userId,
        userEmail,
        orderData
      );
      
      res.json({
        success: true,
        data: { notification },
        message: 'Order confirmation sent successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  sendOrderStatusUpdate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, userEmail, orderData, status } = req.body;
      
      const notification = await this.notificationService.sendOrderStatusUpdate(
        userId,
        userEmail,
        orderData,
        status
      );
      
      res.json({
        success: true,
        data: { notification },
        message: 'Order status update sent successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  sendPaymentSuccessNotification = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, userEmail, orderData } = req.body;
      
      const notification = await this.notificationService.sendPaymentSuccessNotification(
        userId,
        userEmail,
        orderData
      );
      
      res.json({
        success: true,
        data: { notification },
        message: 'Payment success notification sent successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  sendPaymentFailedNotification = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, userEmail, orderData } = req.body;
      
      const notification = await this.notificationService.sendPaymentFailedNotification(
        userId,
        userEmail,
        orderData
      );
      
      res.json({
        success: true,
        data: { notification },
        message: 'Payment failed notification sent successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  getNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const result = await this.notificationService.getNotificationsByUserId(userId, page, limit);
      
      res.json({
        success: true,
        data: { notifications: result.notifications },
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

  markNotificationAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.userId;
      const { notificationId } = req.params;
      
      const notification = await this.notificationService.markNotificationAsRead(notificationId, userId);
      
      res.json({
        success: true,
        data: { notification },
        message: 'Notification marked as read',
      });
    } catch (error) {
      next(error);
    }
  };
} 