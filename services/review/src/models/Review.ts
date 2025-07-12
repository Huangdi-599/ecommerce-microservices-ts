import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  userId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  orderId?: mongoose.Types.ObjectId;
  rating: number;
  title: string;
  content: string;
  images?: string[];
  helpful: number;
  helpfulUsers: mongoose.Types.ObjectId[];
  verified: boolean;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    required: false
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  images: [{
    type: String,
    validate: {
      validator: function(v: string) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Image URL must be a valid HTTP/HTTPS URL'
    }
  }],
  helpful: {
    type: Number,
    default: 0,
    min: 0
  },
  helpfulUsers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  verified: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index for user and product
reviewSchema.index({ userId: 1, productId: 1 }, { unique: true });

// Index for rating and status
reviewSchema.index({ rating: 1, status: 1 });

// Index for helpful count
reviewSchema.index({ helpful: -1 });

// Virtual for average rating (if needed for aggregation)
reviewSchema.virtual('isHelpful').get(function() {
  return this.helpful > 0;
});

// Pre-save middleware to validate rating
reviewSchema.pre('save', function(next) {
  if (this.rating < 1 || this.rating > 5) {
    next(new Error('Rating must be between 1 and 5'));
  }
  next();
});

// Static method to get average rating for a product
reviewSchema.statics.getAverageRating = async function(productId: mongoose.Types.ObjectId) {
  const result = await this.aggregate([
    { $match: { productId, status: 'approved' } },
    { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);
  
  return result.length > 0 ? {
    averageRating: Math.round(result[0].avgRating * 10) / 10,
    totalReviews: result[0].count
  } : { averageRating: 0, totalReviews: 0 };
};

// Static method to get rating distribution
reviewSchema.statics.getRatingDistribution = async function(productId: mongoose.Types.ObjectId) {
  const result = await this.aggregate([
    { $match: { productId, status: 'approved' } },
    { $group: { _id: '$rating', count: { $sum: 1 } } },
    { $sort: { _id: -1 } }
  ]);
  
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  result.forEach(item => {
    distribution[item._id as keyof typeof distribution] = item.count;
  });
  
  return distribution;
};

export const Review = mongoose.model<IReview>('Review', reviewSchema); 