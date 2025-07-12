import Stripe from 'stripe';
import { PaymentModel, IPayment } from '../models/Payment';
import { createError } from 'shared-utils';
import { PaymentStatus } from 'shared-utils';

export class PaymentService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16',
    });
  }

  async createPaymentIntent(orderId: string, userId: string, amount: number, currency: string = 'usd'): Promise<{
    paymentIntent: Stripe.PaymentIntent;
    payment: IPayment;
  }> {
    try {
      // Create payment record
      const payment = new PaymentModel({
        orderId,
        userId,
        amount,
        currency,
        status: PaymentStatus.PENDING,
      });

      // Create Stripe payment intent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata: {
          orderId,
          userId,
        },
      });

      // Update payment record with intent ID
      payment.paymentIntentId = paymentIntent.id;
      await payment.save();

      return { paymentIntent, payment };
    } catch (error) {
      console.error('Payment intent creation error:', error);
      throw createError('Failed to create payment intent', 500);
    }
  }

  async simulatePaymentIntent(orderId: string, userId: string, amount: number, currency: string = 'usd'): Promise<{
    paymentIntent: any;
    payment: IPayment;
  }> {
    // Create payment record
    const payment = new PaymentModel({
      orderId,
      userId,
      amount,
      currency,
      status: PaymentStatus.PENDING,
    });

    // Simulate payment intent
    const paymentIntent = {
      id: `pi_sim_${Date.now()}`,
      client_secret: `pi_sim_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
      amount: Math.round(amount * 100),
      currency,
      status: 'requires_payment_method',
    };

    payment.paymentIntentId = paymentIntent.id;
    await payment.save();

    return { paymentIntent, payment };
  }

  async confirmPayment(paymentIntentId: string): Promise<IPayment> {
    const payment = await PaymentModel.findOne({ paymentIntentId });
    if (!payment) {
      throw createError('Payment not found', 404);
    }

    try {
      // Confirm payment with Stripe
      const paymentIntent = await this.stripe.paymentIntents.confirm(paymentIntentId);
      
      if (paymentIntent.status === 'succeeded') {
        payment.status = PaymentStatus.COMPLETED;
      } else {
        payment.status = PaymentStatus.FAILED;
      }

      await payment.save();
      return payment;
    } catch (error) {
      payment.status = PaymentStatus.FAILED;
      await payment.save();
      throw createError('Payment confirmation failed', 500);
    }
  }

  async simulatePaymentConfirmation(paymentIntentId: string): Promise<IPayment> {
    const payment = await PaymentModel.findOne({ paymentIntentId });
    if (!payment) {
      throw createError('Payment not found', 404);
    }

    // Simulate successful payment
    payment.status = PaymentStatus.COMPLETED;
    await payment.save();
    return payment;
  }

  async getPaymentByOrderId(orderId: string): Promise<IPayment | null> {
    return PaymentModel.findOne({ orderId }).populate('orderId');
  }

  async updatePaymentStatus(paymentIntentId: string, status: PaymentStatus): Promise<IPayment> {
    const payment = await PaymentModel.findOneAndUpdate(
      { paymentIntentId },
      { status },
      { new: true }
    );

    if (!payment) {
      throw createError('Payment not found', 404);
    }

    return payment;
  }

  async handleWebhook(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }

  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    await this.updatePaymentStatus(paymentIntent.id, PaymentStatus.COMPLETED);
  }

  private async handlePaymentFailure(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    await this.updatePaymentStatus(paymentIntent.id, PaymentStatus.FAILED);
  }
} 