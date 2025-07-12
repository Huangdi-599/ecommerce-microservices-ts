import mongoose, { Document, Schema } from 'mongoose';
import { OrderItem } from 'shared-utils';

export interface ICart extends Document {
  userId: string;
  items: OrderItem[];
}

const cartSchema = new Schema<ICart>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [
    {
      productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      name: { type: String, required: true },
    },
  ],
}, { timestamps: true });

export const CartModel = mongoose.model<ICart>('Cart', cartSchema); 