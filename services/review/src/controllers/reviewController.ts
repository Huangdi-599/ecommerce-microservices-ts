import { Request, Response } from 'express';
import { ReviewService } from '../services/reviewService';
import { validateRequest } from '@/shared/utils/validation';

const reviewService = new ReviewService();

export class ReviewController {
  /**
   * Create a new review
   * POST /api/reviews
   */
  async createReview(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const reviewData = {
        userId,
        productId: req.body.productId,
        orderId: req.body.orderId,
        rating: req.body.rating,
        title: req.body.title,
        content: req.body.content,
        images: req.body.images
      };

      // Validate required fields
      const validation = validateRequest(reviewData, {
        productId: 'required|string',
        rating: 'required|number|min:1|max:5',
        title: 'required|string|max:200',
        content: 'required|string|max:2000'
      });

      if (!validation.isValid) {
        res.status(400).json({ error: 'Validation failed', details: validation.errors });
        return;
      }

      const review = await reviewService.createReview(reviewData);
      res.status(201).json({
        message: 'Review created successfully',
        review
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Get review by ID
   * GET /api/reviews/:id
   */
  async getReviewById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const review = await reviewService.getReviewById(id);

      if (!review) {
        res.status(404).json({ error: 'Review not found' });
        return;
      }

      res.status(200).json({ review });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get reviews with filters
   * GET /api/reviews
   */
  async getReviews(req: Request, res: Response): Promise<void> {
    try {
      const {
        productId,
        userId,
        rating,
        status,
        verified,
        page,
        limit,
        sortBy,
        sortOrder
      } = req.query;

      const filters = {
        productId: productId as string,
        userId: userId as string,
        rating: rating ? parseInt(rating as string) : undefined,
        status: status as 'pending' | 'approved' | 'rejected',
        verified: verified === 'true',
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
        sortBy: sortBy as 'createdAt' | 'rating' | 'helpful',
        sortOrder: sortOrder as 'asc' | 'desc'
      };

      const result = await reviewService.getReviews(filters);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Update review
   * PUT /api/reviews/:id
   */
  async updateReview(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const updateData = {
        rating: req.body.rating,
        title: req.body.title,
        content: req.body.content,
        images: req.body.images
      };

      // Validate rating if provided
      if (updateData.rating && (updateData.rating < 1 || updateData.rating > 5)) {
        res.status(400).json({ error: 'Rating must be between 1 and 5' });
        return;
      }

      const review = await reviewService.updateReview(id, userId, updateData);

      if (!review) {
        res.status(404).json({ error: 'Review not found or unauthorized' });
        return;
      }

      res.status(200).json({
        message: 'Review updated successfully',
        review
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Delete review
   * DELETE /api/reviews/:id
   */
  async deleteReview(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const success = await reviewService.deleteReview(id, userId);

      if (!success) {
        res.status(404).json({ error: 'Review not found or unauthorized' });
        return;
      }

      res.status(200).json({ message: 'Review deleted successfully' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Mark review as helpful
   * POST /api/reviews/:id/helpful
   */
  async markHelpful(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const review = await reviewService.markHelpful(id, userId);

      if (!review) {
        res.status(404).json({ error: 'Review not found' });
        return;
      }

      res.status(200).json({
        message: 'Review helpful status updated',
        review
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Get average rating for a product
   * GET /api/reviews/product/:productId/rating
   */
  async getAverageRating(req: Request, res: Response): Promise<void> {
    try {
      const { productId } = req.params;
      const rating = await reviewService.getAverageRating(productId);
      res.status(200).json(rating);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get rating distribution for a product
   * GET /api/reviews/product/:productId/distribution
   */
  async getRatingDistribution(req: Request, res: Response): Promise<void> {
    try {
      const { productId } = req.params;
      const distribution = await reviewService.getRatingDistribution(productId);
      res.status(200).json(distribution);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get reviews by product with comprehensive data
   * GET /api/reviews/product/:productId
   */
  async getProductReviews(req: Request, res: Response): Promise<void> {
    try {
      const { productId } = req.params;
      const {
        page = '1',
        limit = '10',
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const result = await reviewService.getProductReviews(
        productId,
        parseInt(page as string),
        parseInt(limit as string),
        sortBy as 'createdAt' | 'rating' | 'helpful',
        sortOrder as 'asc' | 'desc'
      );

      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Update review status (admin only)
   * PATCH /api/reviews/:id/status
   */
  async updateReviewStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const user = (req as any).user;

      if (!user || user.role !== 'admin') {
        res.status(403).json({ error: 'Admin access required' });
        return;
      }

      if (!['approved', 'rejected'].includes(status)) {
        res.status(400).json({ error: 'Invalid status. Must be "approved" or "rejected"' });
        return;
      }

      const review = await reviewService.updateReviewStatus(id, status);

      if (!review) {
        res.status(404).json({ error: 'Review not found' });
        return;
      }

      res.status(200).json({
        message: 'Review status updated successfully',
        review
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Mark review as verified (admin only)
   * PATCH /api/reviews/:id/verified
   */
  async markVerified(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { verified } = req.body;
      const user = (req as any).user;

      if (!user || user.role !== 'admin') {
        res.status(403).json({ error: 'Admin access required' });
        return;
      }

      if (typeof verified !== 'boolean') {
        res.status(400).json({ error: 'Verified must be a boolean' });
        return;
      }

      const review = await reviewService.markVerified(id, verified);

      if (!review) {
        res.status(404).json({ error: 'Review not found' });
        return;
      }

      res.status(200).json({
        message: 'Review verification status updated',
        review
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Get user's reviews
   * GET /api/reviews/user/me
   */
  async getUserReviews(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const {
        page = '1',
        limit = '10',
        status
      } = req.query;

      const filters = {
        userId,
        status: status as 'pending' | 'approved' | 'rejected',
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      };

      const result = await reviewService.getReviews(filters);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
} 