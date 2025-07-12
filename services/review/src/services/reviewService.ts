import { Review, IReview } from '../models/Review';
import mongoose from 'mongoose';
import axios from 'axios';

export interface CreateReviewData {
  userId: string;
  productId: string;
  orderId?: string;
  rating: number;
  title: string;
  content: string;
  images?: string[];
}

export interface UpdateReviewData {
  rating?: number;
  title?: string;
  content?: string;
  images?: string[];
}

export interface ReviewFilters {
  productId?: string;
  userId?: string;
  rating?: number;
  status?: 'pending' | 'approved' | 'rejected';
  verified?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'rating' | 'helpful';
  sortOrder?: 'asc' | 'desc';
}

export class ReviewService {
  /**
   * Create a new review
   */
  async createReview(data: CreateReviewData): Promise<IReview> {
    // Check if user has already reviewed this product
    const existingReview = await Review.findOne({
      userId: new mongoose.Types.ObjectId(data.userId),
      productId: new mongoose.Types.ObjectId(data.productId)
    });

    if (existingReview) {
      throw new Error('User has already reviewed this product');
    }

    // Validate rating
    if (data.rating < 1 || data.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Verify product exists
    try {
      const productResponse = await axios.get(
        `${process.env.PRODUCT_SERVICE_URL}/api/products/${data.productId}`
      );
      if (!productResponse.data) {
        throw new Error('Product not found');
      }
    } catch (error) {
      throw new Error('Failed to verify product');
    }

    // Verify user exists
    try {
      const userResponse = await axios.get(
        `${process.env.USER_SERVICE_URL}/api/users/${data.userId}`
      );
      if (!userResponse.data) {
        throw new Error('User not found');
      }
    } catch (error) {
      throw new Error('Failed to verify user');
    }

    const review = new Review({
      userId: new mongoose.Types.ObjectId(data.userId),
      productId: new mongoose.Types.ObjectId(data.productId),
      orderId: data.orderId ? new mongoose.Types.ObjectId(data.orderId) : undefined,
      rating: data.rating,
      title: data.title,
      content: data.content,
      images: data.images || [],
      verified: false,
      status: 'pending'
    });

    return await review.save();
  }

  /**
   * Get review by ID
   */
  async getReviewById(reviewId: string): Promise<IReview | null> {
    return await Review.findById(reviewId)
      .populate('userId', 'name email')
      .populate('productId', 'name images');
  }

  /**
   * Get reviews with filters
   */
  async getReviews(filters: ReviewFilters = {}): Promise<{
    reviews: IReview[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const {
      productId,
      userId,
      rating,
      status,
      verified,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = filters;

    const query: any = {};

    if (productId) {
      query.productId = new mongoose.Types.ObjectId(productId);
    }

    if (userId) {
      query.userId = new mongoose.Types.ObjectId(userId);
    }

    if (rating) {
      query.rating = rating;
    }

    if (status) {
      query.status = status;
    }

    if (verified !== undefined) {
      query.verified = verified;
    }

    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate('userId', 'name email')
        .populate('productId', 'name images')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit),
      Review.countDocuments(query)
    ]);

    return {
      reviews,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Update review
   */
  async updateReview(reviewId: string, userId: string, data: UpdateReviewData): Promise<IReview | null> {
    const review = await Review.findById(reviewId);

    if (!review) {
      throw new Error('Review not found');
    }

    // Check if user owns the review or is admin
    if (review.userId.toString() !== userId) {
      throw new Error('Unauthorized to update this review');
    }

    // Validate rating if provided
    if (data.rating && (data.rating < 1 || data.rating > 5)) {
      throw new Error('Rating must be between 1 and 5');
    }

    Object.assign(review, data);
    return await review.save();
  }

  /**
   * Delete review
   */
  async deleteReview(reviewId: string, userId: string): Promise<boolean> {
    const review = await Review.findById(reviewId);

    if (!review) {
      throw new Error('Review not found');
    }

    // Check if user owns the review or is admin
    if (review.userId.toString() !== userId) {
      throw new Error('Unauthorized to delete this review');
    }

    await Review.findByIdAndDelete(reviewId);
    return true;
  }

  /**
   * Mark review as helpful
   */
  async markHelpful(reviewId: string, userId: string): Promise<IReview | null> {
    const review = await Review.findById(reviewId);

    if (!review) {
      throw new Error('Review not found');
    }

    const userIdObj = new mongoose.Types.ObjectId(userId);

    // Check if user already marked as helpful
    if (review.helpfulUsers.includes(userIdObj)) {
      // Remove helpful mark
      review.helpfulUsers = review.helpfulUsers.filter(
        id => id.toString() !== userId
      );
      review.helpful = Math.max(0, review.helpful - 1);
    } else {
      // Add helpful mark
      review.helpfulUsers.push(userIdObj);
      review.helpful += 1;
    }

    return await review.save();
  }

  /**
   * Get average rating for a product
   */
  async getAverageRating(productId: string): Promise<{
    averageRating: number;
    totalReviews: number;
  }> {
    return await Review.getAverageRating(new mongoose.Types.ObjectId(productId));
  }

  /**
   * Get rating distribution for a product
   */
  async getRatingDistribution(productId: string): Promise<{
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  }> {
    return await Review.getRatingDistribution(new mongoose.Types.ObjectId(productId));
  }

  /**
   * Approve/reject review (admin only)
   */
  async updateReviewStatus(reviewId: string, status: 'approved' | 'rejected'): Promise<IReview | null> {
    const review = await Review.findById(reviewId);

    if (!review) {
      throw new Error('Review not found');
    }

    review.status = status;
    return await review.save();
  }

  /**
   * Mark review as verified (admin only)
   */
  async markVerified(reviewId: string, verified: boolean): Promise<IReview | null> {
    const review = await Review.findById(reviewId);

    if (!review) {
      throw new Error('Review not found');
    }

    review.verified = verified;
    return await review.save();
  }

  /**
   * Get reviews by product with pagination
   */
  async getProductReviews(
    productId: string,
    page: number = 1,
    limit: number = 10,
    sortBy: 'createdAt' | 'rating' | 'helpful' = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<{
    reviews: IReview[];
    total: number;
    page: number;
    totalPages: number;
    averageRating: number;
    totalReviews: number;
    ratingDistribution: { 1: number; 2: number; 3: number; 4: number; 5: number };
  }> {
    const query = {
      productId: new mongoose.Types.ObjectId(productId),
      status: 'approved'
    };

    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [reviews, total, averageRating, ratingDistribution] = await Promise.all([
      Review.find(query)
        .populate('userId', 'name email')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit),
      Review.countDocuments(query),
      this.getAverageRating(productId),
      this.getRatingDistribution(productId)
    ]);

    return {
      reviews,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      averageRating: averageRating.averageRating,
      totalReviews: averageRating.totalReviews,
      ratingDistribution
    };
  }
} 