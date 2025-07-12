import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/productService';
import { validateRequest, productSchema, paginationSchema } from 'shared-utils';

export class ProductController {
  private productService = new ProductService();

  getProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        sort: req.query.sort as string || 'createdAt',
        order: (req.query.order as 'asc' | 'desc') || 'desc',
      };

      const result = await this.productService.getProducts(params);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  };

  createProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await this.productService.createProduct(req.body);
      res.status(201).json({
        success: true,
        data: { product },
        message: 'Product created successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  getProductById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await this.productService.getProductById(req.params.id);
      res.json({ success: true, data: { product } });
    } catch (error) {
      next(error);
    }
  };

  updateProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await this.productService.updateProduct(req.params.id, req.body);
      res.json({
        success: true,
        data: { product },
        message: 'Product updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.productService.deleteProduct(req.params.id);
      res.json({
        success: true,
        message: 'Product deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  uploadProductImages = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.files || !Array.isArray(req.files)) {
        return res.status(400).json({
          success: false,
          error: 'No images provided',
        });
      }

      const product = await this.productService.uploadProductImages(req.params.id, req.files);
      res.json({
        success: true,
        data: { product },
        message: 'Images uploaded successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  deleteProductImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { imageUrl } = req.body;
      if (!imageUrl) {
        return res.status(400).json({
          success: false,
          error: 'Image URL is required',
        });
      }

      const product = await this.productService.deleteProductImage(req.params.id, imageUrl);
      res.json({
        success: true,
        data: { product },
        message: 'Image deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  searchProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Search query is required',
        });
      }

      const params = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
      };

      const result = await this.productService.searchProducts(q, params);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  };

  getProductsByCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
      };

      const result = await this.productService.getProductsByCategory(req.params.categoryId, params);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  };
} 