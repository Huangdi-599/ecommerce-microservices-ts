import nodemailer from 'nodemailer';
import mailgun from 'mailgun-js';
import { createError } from 'shared-utils';

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class MailService {
  private mailgun: any;
  private nodemailerTransporter: nodemailer.Transporter;
  private useMailgun: boolean;

  constructor() {
    this.useMailgun = !!(process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN);
    
    if (this.useMailgun) {
      this.mailgun = mailgun({
        apiKey: process.env.MAILGUN_API_KEY!,
        domain: process.env.MAILGUN_DOMAIN!,
      });
    } else {
      // Use Nodemailer with Gmail
      this.nodemailerTransporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS,
        },
      });
    }
  }

  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      if (this.useMailgun) {
        return await this.sendWithMailgun(emailData);
      } else {
        return await this.sendWithNodemailer(emailData);
      }
    } catch (error) {
      console.error('Email sending failed:', error);
      throw createError('Failed to send email', 500);
    }
  }

  private async sendWithMailgun(emailData: EmailData): Promise<boolean> {
    const mailgunData = {
      from: process.env.MAILGUN_FROM_EMAIL!,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text || this.stripHtml(emailData.html),
    };

    return new Promise((resolve, reject) => {
      this.mailgun.messages().send(mailgunData, (error: any, body: any) => {
        if (error) {
          console.error('Mailgun error:', error);
          reject(error);
        } else {
          console.log('Mailgun email sent:', body);
          resolve(true);
        }
      });
    });
  }

  private async sendWithNodemailer(emailData: EmailData): Promise<boolean> {
    const mailOptions = {
      from: process.env.GMAIL_USER!,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text || this.stripHtml(emailData.html),
    };

    const result = await this.nodemailerTransporter.sendMail(mailOptions);
    console.log('Nodemailer email sent:', result.messageId);
    return true;
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '');
  }

  async sendOrderConfirmationEmail(userEmail: string, orderData: any): Promise<boolean> {
    const subject = 'Order Confirmation - Your Order Has Been Placed';
    const html = this.generateOrderConfirmationTemplate(orderData);
    
    return this.sendEmail({
      to: userEmail,
      subject,
      html,
    });
  }

  async sendOrderStatusUpdateEmail(userEmail: string, orderData: any, status: string): Promise<boolean> {
    const subject = `Order Status Update - ${status}`;
    const html = this.generateOrderStatusTemplate(orderData, status);
    
    return this.sendEmail({
      to: userEmail,
      subject,
      html,
    });
  }

  private generateOrderConfirmationTemplate(orderData: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; }
          .order-details { background-color: #f8f9fa; padding: 15px; margin: 20px 0; border-radius: 5px; }
          .item { margin: 10px 0; padding: 10px; border-bottom: 1px solid #eee; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmation</h1>
            <p>Thank you for your order!</p>
          </div>
          <div class="content">
            <h2>Order #${orderData.orderId}</h2>
            <p>Your order has been successfully placed and is being processed.</p>
            
            <div class="order-details">
              <h3>Order Summary</h3>
              <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
              <p><strong>Total Amount:</strong> $${orderData.totalAmount}</p>
              <p><strong>Status:</strong> Pending</p>
            </div>
            
            <h3>Order Items</h3>
            ${orderData.items.map((item: any) => `
              <div class="item">
                <p><strong>${item.name}</strong></p>
                <p>Quantity: ${item.quantity}</p>
                <p>Price: $${item.price}</p>
              </div>
            `).join('')}
            
            <p>We'll send you updates as your order progresses.</p>
          </div>
          <div class="footer">
            <p>Thank you for shopping with us!</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateOrderStatusTemplate(orderData: any, status: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Status Update</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; }
          .status-update { background-color: #e7f3ff; padding: 15px; margin: 20px 0; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Status Update</h1>
          </div>
          <div class="content">
            <h2>Order #${orderData.orderId}</h2>
            
            <div class="status-update">
              <h3>Status Update</h3>
              <p><strong>New Status:</strong> ${status}</p>
              <p><strong>Updated:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <p>Your order status has been updated. You can track your order in your account dashboard.</p>
          </div>
          <div class="footer">
            <p>Thank you for shopping with us!</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
} 