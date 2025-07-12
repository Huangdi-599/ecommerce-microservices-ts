import { NotificationModel, INotification } from '../models/Notification';
import { MailService } from './mailService';
import { createError } from 'shared-utils';
import { NotificationType } from 'shared-utils';

export class NotificationService {
  private mailService = new MailService();

  async createNotification(notificationData: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    metadata?: Record<string, any>;
  }): Promise<INotification> {
    const notification = new NotificationModel(notificationData);
    return notification.save();
  }

  async sendOrderConfirmation(userId: string, userEmail: string, orderData: any): Promise<INotification> {
    try {
      // Create notification record
      const notification = await this.createNotification({
        userId,
        type: NotificationType.ORDER_CONFIRMATION,
        title: 'Order Confirmation',
        message: `Your order #${orderData.orderId} has been placed successfully.`,
        metadata: { orderId: orderData.orderId },
      });

      // Send email
      const emailSent = await this.mailService.sendOrderConfirmationEmail(userEmail, orderData);
      
      // Update notification with email status
      notification.emailSent = emailSent;
      notification.emailSentAt = new Date();
      await notification.save();

      return notification;
    } catch (error) {
      console.error('Order confirmation notification failed:', error);
      throw createError('Failed to send order confirmation', 500);
    }
  }

  async sendOrderStatusUpdate(userId: string, userEmail: string, orderData: any, status: string): Promise<INotification> {
    try {
      // Create notification record
      const notification = await this.createNotification({
        userId,
        type: NotificationType.ORDER_SHIPPED,
        title: 'Order Status Update',
        message: `Your order #${orderData.orderId} status has been updated to: ${status}`,
        metadata: { orderId: orderData.orderId, status },
      });

      // Send email
      const emailSent = await this.mailService.sendOrderStatusUpdateEmail(userEmail, orderData, status);
      
      // Update notification with email status
      notification.emailSent = emailSent;
      notification.emailSentAt = new Date();
      await notification.save();

      return notification;
    } catch (error) {
      console.error('Order status update notification failed:', error);
      throw createError('Failed to send order status update', 500);
    }
  }

  async sendPaymentSuccessNotification(userId: string, userEmail: string, orderData: any): Promise<INotification> {
    try {
      const notification = await this.createNotification({
        userId,
        type: NotificationType.PAYMENT_SUCCESS,
        title: 'Payment Successful',
        message: `Payment for order #${orderData.orderId} has been processed successfully.`,
        metadata: { orderId: orderData.orderId },
      });

      // Send email
      const emailSent = await this.mailService.sendEmail({
        to: userEmail,
        subject: 'Payment Successful - Order Confirmed',
        html: this.generatePaymentSuccessTemplate(orderData),
      });

      notification.emailSent = emailSent;
      notification.emailSentAt = new Date();
      await notification.save();

      return notification;
    } catch (error) {
      console.error('Payment success notification failed:', error);
      throw createError('Failed to send payment success notification', 500);
    }
  }

  async sendPaymentFailedNotification(userId: string, userEmail: string, orderData: any): Promise<INotification> {
    try {
      const notification = await this.createNotification({
        userId,
        type: NotificationType.PAYMENT_FAILED,
        title: 'Payment Failed',
        message: `Payment for order #${orderData.orderId} has failed. Please try again.`,
        metadata: { orderId: orderData.orderId },
      });

      // Send email
      const emailSent = await this.mailService.sendEmail({
        to: userEmail,
        subject: 'Payment Failed - Action Required',
        html: this.generatePaymentFailedTemplate(orderData),
      });

      notification.emailSent = emailSent;
      notification.emailSentAt = new Date();
      await notification.save();

      return notification;
    } catch (error) {
      console.error('Payment failed notification failed:', error);
      throw createError('Failed to send payment failed notification', 500);
    }
  }

  async getNotificationsByUserId(userId: string, page: number = 1, limit: number = 10): Promise<{
    notifications: INotification[];
    total: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      NotificationModel.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      NotificationModel.countDocuments({ userId }),
    ]);

    return {
      notifications,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async markNotificationAsRead(notificationId: string, userId: string): Promise<INotification> {
    const notification = await NotificationModel.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      throw createError('Notification not found', 404);
    }

    return notification;
  }

  private generatePaymentSuccessTemplate(orderData: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Payment Successful</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #d4edda; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Successful</h1>
            <p>Your payment has been processed successfully!</p>
          </div>
          <div class="content">
            <h2>Order #${orderData.orderId}</h2>
            <p>Your payment for this order has been confirmed and your order is now being processed.</p>
            <p><strong>Amount Paid:</strong> $${orderData.totalAmount}</p>
            <p>Thank you for your purchase!</p>
          </div>
          <div class="footer">
            <p>Thank you for shopping with us!</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generatePaymentFailedTemplate(orderData: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Payment Failed</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f8d7da; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Failed</h1>
            <p>We couldn't process your payment</p>
          </div>
          <div class="content">
            <h2>Order #${orderData.orderId}</h2>
            <p>Unfortunately, your payment for this order could not be processed. This could be due to:</p>
            <ul>
              <li>Insufficient funds</li>
              <li>Invalid payment information</li>
              <li>Card restrictions</li>
            </ul>
            <p>Please try again with a different payment method or contact your bank for assistance.</p>
          </div>
          <div class="footer">
            <p>If you need help, please contact our support team.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
} 