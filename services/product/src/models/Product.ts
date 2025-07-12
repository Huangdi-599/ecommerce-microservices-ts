import mongoose, { Document, Schema } from 'mongoose';
import { Product as ProductType } from 'shared-utils';

export interface IProduct extends ProductType, Document {
  categoryId: mongoose.Types.ObjectId;
  images: string[]; // Cloudinary URLs
  averageRating?: number;
  reviewCount?: number;
}

const productSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true, // For text search
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  images: [{
    type: String, // Cloudinary URLs
    required: false,
  }],
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  reviewCount: {
    type: Number,
    default: 0,
    min: 0,
  },
}, {
  timestamps: true,
});

// Text index for search functionality
productSchema.index({
  name: 'text',
  description: 'text',
  category: 'text',
});

export const ProductModel = mongoose.model<IProduct>('Product', productSchema); 