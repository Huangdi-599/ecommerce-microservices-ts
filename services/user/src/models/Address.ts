import mongoose, { Document, Schema } from 'mongoose';
import { Address as AddressType } from 'shared-utils';

export interface IAddress extends AddressType, Document {
  userId: string;
}

const addressSchema = new Schema<IAddress>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, required: true },
}, { timestamps: true });

export const AddressModel = mongoose.model<IAddress>('Address', addressSchema); 