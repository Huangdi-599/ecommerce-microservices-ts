import mongoose, { Document, Schema } from 'mongoose';
import { Notification as NotificationType, NotificationType as NotificationTypeEnum } from 'shared-utils';

export interface INotification extends NotificationType, Document {
  userId: string;
  type: NotificationTypeEnum;
  title: string;
  message: string;
  isRead: boolean;
  emailSent: boolean;
  emailSentAt?: Date;
  metadata?: Record<string, any>;
}

const notificationSchema = new Schema<INotification>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: Object.values(NotificationTypeEnum),
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  emailSent: { type: Boolean, default: false },
  emailSentAt: { type: Date },
  metadata: { type: Schema.Types.Mixed },
}, { timestamps: true });

export const NotificationModel = mongoose.model<INotification>('Notification', notificationSchema); 