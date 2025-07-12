import { Request, Response } from 'express';
import { SearchService } from '../services/searchService';
import { validateRequest } from '@/shared/utils/validation';

const searchService = new SearchService();

export class SearchController {
  /**
   * Search products
   * GET /api/search/products
   */
  async searchProducts(req: Request, res: Response): Promise<void> {
    try {
      const {
        q = '',
        category,
        priceMin,
        priceMax,
        rating,
        inStock,
        brand,
        tags,
        page = '1',
        limit = '20',
        sortBy = 'score',
        sortOrder = 'desc',
        fuzzy = 'true',
        highlight = 'true'
      } = req.query;

      const filters = {
        category: category as string,
        priceMin: priceMin ? parseFloat(priceMin as string) : undefined,
        priceMax: priceMax ? parseFloat(priceMax as string) : undefined,
        rating: rating ? parseFloat(rating as string) : undefined,
        inStock: inStock === 'true',
        brand: brand as string,
        tags: tags ? (tags as string).split(',') : undefined
      };

      const options = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
        fuzzy: fuzzy === 'true',
        highlight: highlight === 'true'
      };

      const result = await searchService.searchProducts(q as string, filters, options);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Search categories
   * GET /api/search/categories
   */
  async searchCategories(req: Request, res: Response): Promise<void> {
    try {
      const { q = '' } = req.query;
      const results = await searchService.searchCategories(q as string);
      res.status(200).json({ results });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get search suggestions
   * GET /api/search/suggestions
   */
  async getSuggestions(req: Request, res: Response): Promise<void> {
    try {
      const { q = '', type = 'product' } = req.query;
      
      if (!q || (q as string).length < 2) {
        res.status(400).json({ error: 'Query must be at least 2 characters long' });
        return;
      }

      const suggestions = await searchService.getSuggestions(
        q as string,
        type as 'product' | 'category'
      );
      
      res.status(200).json({ suggestions });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Index a document
   * POST /api/search/index
   */
  async indexDocument(req: Request, res: Response): Promise<void> {
    try {
      const { documentId, documentType, service } = req.body;

      // Validate required fields
      const validation = validateRequest(req.body, {
        documentId: 'required|string',
        documentType: 'required|string|in:product,category,review',
        service: 'required|string'
      });

      if (!validation.isValid) {
        res.status(400).json({ error: 'Validation failed', details: validation.errors });
        return;
      }

      await searchService.indexDocument({
        documentId,
        documentType: documentType as 'product' | 'category' | 'review',
        service
      });

      res.status(200).json({
        message: 'Document indexed successfully',
        documentId,
        documentType,
        service
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Bulk index documents
   * POST /api/search/bulk-index
   */
  async bulkIndexDocuments(req: Request, res: Response): Promise<void> {
    try {
      const { documents } = req.body;

      // Validate required fields
      const validation = validateRequest(req.body, {
        documents: 'required|array'
      });

      if (!validation.isValid) {
        res.status(400).json({ error: 'Validation failed', details: validation.errors });
        return;
      }

      const result = await searchService.bulkIndexDocuments({ documents });
      
      res.status(200).json({
        message: 'Bulk indexing completed',
        ...result
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Remove document from index
   * DELETE /api/search/index/:type/:id
   */
  async removeDocument(req: Request, res: Response): Promise<void> {
    try {
      const { type, id } = req.params;

      if (!['product', 'category', 'review'].includes(type)) {
        res.status(400).json({ error: 'Invalid document type' });
        return;
      }

      await searchService.removeDocument(id, type as 'product' | 'category' | 'review');

      res.status(200).json({
        message: 'Document removed from index successfully',
        documentId: id,
        documentType: type
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Update document in index
   * PUT /api/search/index/:type/:id
   */
  async updateDocument(req: Request, res: Response): Promise<void> {
    try {
      const { type, id } = req.params;

      if (!['product', 'category', 'review'].includes(type)) {
        res.status(400).json({ error: 'Invalid document type' });
        return;
      }

      await searchService.updateDocument(id, type as 'product' | 'category' | 'review');

      res.status(200).json({
        message: 'Document updated in index successfully',
        documentId: id,
        documentType: type
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Get indexing status
   * GET /api/search/status
   */
  async getIndexingStatus(req: Request, res: Response): Promise<void> {
    try {
      const {
        documentType,
        service,
        status,
        page = '1',
        limit = '20'
      } = req.query;

      const filters = {
        documentType: documentType as 'product' | 'category' | 'review',
        service: service as string,
        status: status as 'indexed' | 'pending' | 'failed'
      };

      const result = await searchService.getIndexingStatus(filters);
      
      res.status(200).json({
        ...result,
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Reindex service
   * POST /api/search/reindex/:service/:type
   */
  async reindexService(req: Request, res: Response): Promise<void> {
    try {
      const { service, type } = req.params;

      if (!['product', 'category', 'review'].includes(type)) {
        res.status(400).json({ error: 'Invalid document type' });
        return;
      }

      const result = await searchService.reindexService(
        service,
        type as 'product' | 'category' | 'review'
      );

      res.status(200).json({
        message: 'Service reindexing completed',
        service,
        documentType: type,
        ...result
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Get search statistics
   * GET /api/search/stats
   */
  async getSearchStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await searchService.getSearchStats();
      res.status(200).json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Health check for search service
   * GET /api/search/health
   */
  async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const stats = await searchService.getSearchStats();
      
      res.status(200).json({
        status: 'OK',
        service: 'Search Service',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        elasticsearch: {
          health: stats.healthStatus,
          indices: Object.keys(stats.indexStats || {}).length
        }
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'ERROR',
        service: 'Search Service',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
} 