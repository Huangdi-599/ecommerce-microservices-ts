import { Request, Response, NextFunction } from 'express';
import Stripe from 'stripe';
import { PaymentService } from '../services/paymentService';

export class PaymentController {
  private paymentService = new PaymentService();

  createPaymentIntent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.userId;
      const { orderId, amount, currency = 'usd' } = req.body;

      // Check if using simulation mode
      const useSimulation = process.env.NODE_ENV === 'development' && !process.env.STRIPE_SECRET_KEY;

      let result;
      if (useSimulation) {
        result = await this.paymentService.simulatePaymentIntent(orderId, userId, amount, currency);
      } else {
        result = await this.paymentService.createPaymentIntent(orderId, userId, amount, currency);
      }

      res.json({
        success: true,
        data: {
          paymentIntent: {
            id: result.paymentIntent.id,
            client_secret: result.paymentIntent.client_secret,
            amount: result.paymentIntent.amount,
            currency: result.paymentIntent.currency,
            status: result.paymentIntent.status,
          },
          payment: result.payment,
        },
        message: 'Payment intent created successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  confirmPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { paymentIntentId } = req.body;

      // Check if using simulation mode
      const useSimulation = process.env.NODE_ENV === 'development' && !process.env.STRIPE_SECRET_KEY;

      let payment;
      if (useSimulation) {
        payment = await this.paymentService.simulatePaymentConfirmation(paymentIntentId);
      } else {
        payment = await this.paymentService.confirmPayment(paymentIntentId);
      }

      res.json({
        success: true,
        data: { payment },
        message: 'Payment confirmed successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  getPaymentByOrderId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orderId } = req.params;
      const payment = await this.paymentService.getPaymentByOrderId(orderId);

      if (!payment) {
        return res.status(404).json({
          success: false,
          error: 'Payment not found',
        });
      }

      res.json({
        success: true,
        data: { payment },
      });
    } catch (error) {
      next(error);
    }
  };

  handleWebhook = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sig = req.headers['stripe-signature'] as string;
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!endpointSecret) {
        return res.status(400).json({
          success: false,
          error: 'Webhook secret not configured',
        });
      }

      let event: Stripe.Event;

      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
          apiVersion: '2023-10-16',
        });
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return res.status(400).json({
          success: false,
          error: 'Invalid webhook signature',
        });
      }

      await this.paymentService.handleWebhook(event);

      res.json({ success: true, message: 'Webhook processed successfully' });
    } catch (error) {
      next(error);
    }
  };
} 