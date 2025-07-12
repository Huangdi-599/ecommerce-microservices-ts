import mongoose, { Document, Schema } from 'mongoose';
import { User, Address as AddressType } from 'shared-utils';

export interface IUser extends User, Document {
  addresses: mongoose.Types.ObjectId[];
  preferences: mongoose.Types.ObjectId | null;
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  addresses: [{ type: Schema.Types.ObjectId, ref: 'Address' }],
  preferences: { type: Schema.Types.ObjectId, ref: 'Preferences', default: null },
}, { timestamps: true });

export const UserModel = mongoose.model<IUser>('User', userSchema); 