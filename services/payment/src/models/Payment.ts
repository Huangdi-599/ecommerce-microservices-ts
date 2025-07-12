import mongoose, { Document, Schema } from 'mongoose';
import { PaymentStatus } from 'shared-utils';

export interface IPayment extends Document {
  orderId: string;
  userId: string;
  amount: number;
  currency: string;
  paymentIntentId?: string;
  status: PaymentStatus;
  paymentMethod?: string;
  metadata?: Record<string, any>;
}

const paymentSchema = new Schema<IPayment>({
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'usd' },
  paymentIntentId: { type: String },
  status: {
    type: String,
    enum: Object.values(PaymentStatus),
    default: PaymentStatus.PENDING,
  },
  paymentMethod: { type: String },
  metadata: { type: Schema.Types.Mixed },
}, { timestamps: true });

export const PaymentModel = mongoose.model<IPayment>('Payment', paymentSchema); 