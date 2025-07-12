import mongoose, { Document, Schema } from 'mongoose';

export interface ISearchIndex extends Document {
  documentId: string;
  documentType: 'product' | 'category' | 'review';
  service: string;
  indexedAt: Date;
  lastUpdated: Date;
  status: 'indexed' | 'pending' | 'failed';
  error?: string;
}

const searchIndexSchema = new Schema<ISearchIndex>({
  documentId: {
    type: String,
    required: true,
    index: true
  },
  documentType: {
    type: String,
    enum: ['product', 'category', 'review'],
    required: true,
    index: true
  },
  service: {
    type: String,
    required: true,
    index: true
  },
  indexedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['indexed', 'pending', 'failed'],
    default: 'pending',
    index: true
  },
  error: {
    type: String
  }
}, {
  timestamps: true
});

// Compound index for document lookup
searchIndexSchema.index({ documentId: 1, documentType: 1, service: 1 }, { unique: true });

// Index for status queries
searchIndexSchema.index({ status: 1, service: 1 });

// Index for cleanup queries
searchIndexSchema.index({ lastUpdated: 1 });

export const SearchIndex = mongoose.model<ISearchIndex>('SearchIndex', searchIndexSchema); 