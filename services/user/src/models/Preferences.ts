import mongoose, { Document, Schema } from 'mongoose';

export interface IPreferences extends Document {
  userId: string;
  newsletter: boolean;
  theme: string;
  language: string;
}

const preferencesSchema = new Schema<IPreferences>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  newsletter: { type: Boolean, default: false },
  theme: { type: String, default: 'light' },
  language: { type: String, default: 'en' },
}, { timestamps: true });

export const PreferencesModel = mongoose.model<IPreferences>('Preferences', preferencesSchema); 