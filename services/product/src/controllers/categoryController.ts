import { Request, Response, NextFunction } from 'express';
import { CategoryService } from '../services/categoryService';

export class CategoryController {
  private categoryService = new CategoryService();

  getCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const categories = await this.categoryService.getCategories();
      res.json({ success: true, data: { categories } });
    } catch (error) {
      next(error);
    }
  };

  createCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = await this.categoryService.createCategory(req.body);
      res.status(201).json({
        success: true,
        data: { category },
        message: 'Category created successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = await this.categoryService.getCategoryById(req.params.id);
      res.json({ success: true, data: { category } });
    } catch (error) {
      next(error);
    }
  };

  updateCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = await this.categoryService.updateCategory(req.params.id, req.body);
      res.json({
        success: true,
        data: { category },
        message: 'Category updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.categoryService.deleteCategory(req.params.id);
      res.json({
        success: true,
        message: 'Category deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  getCategoryBySlug = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = await this.categoryService.getCategoryBySlug(req.params.slug);
      res.json({ success: true, data: { category } });
    } catch (error) {
      next(error);
    }
  };

  getSubcategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const subcategories = await this.categoryService.getSubcategories(req.params.parentId);
      res.json({ success: true, data: { subcategories } });
    } catch (error) {
      next(error);
    }
  };
} 