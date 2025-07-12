import { CategoryModel, ICategory } from '../models/Category';
import { ProductModel } from '../models/Product';
import { createError } from 'shared-utils';

export class CategoryService {
  async createCategory(categoryData: Partial<ICategory>): Promise<ICategory> {
    const category = new CategoryModel(categoryData);
    return category.save();
  }

  async getCategories(): Promise<ICategory[]> {
    return CategoryModel.find({ isActive: true }).populate('parentId', 'name slug');
  }

  async getCategoryById(id: string): Promise<ICategory> {
    const category = await CategoryModel.findById(id)
      .populate('parentId', 'name slug')
      .where({ isActive: true });

    if (!category) {
      throw createError('Category not found', 404);
    }

    return category;
  }

  async updateCategory(id: string, updateData: Partial<ICategory>): Promise<ICategory> {
    const category = await CategoryModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('parentId', 'name slug');

    if (!category) {
      throw createError('Category not found', 404);
    }

    return category;
  }

  async deleteCategory(id: string): Promise<void> {
    // Check if category has products
    const productCount = await ProductModel.countDocuments({ categoryId: id, isActive: true });
    if (productCount > 0) {
      throw createError('Cannot delete category with existing products', 400);
    }

    // Check if category has subcategories
    const subcategoryCount = await CategoryModel.countDocuments({ parentId: id, isActive: true });
    if (subcategoryCount > 0) {
      throw createError('Cannot delete category with existing subcategories', 400);
    }

    const category = await CategoryModel.findByIdAndUpdate(id, { isActive: false });
    if (!category) {
      throw createError('Category not found', 404);
    }
  }

  async getCategoryBySlug(slug: string): Promise<ICategory> {
    const category = await CategoryModel.findOne({ slug, isActive: true })
      .populate('parentId', 'name slug');

    if (!category) {
      throw createError('Category not found', 404);
    }

    return category;
  }

  async getSubcategories(parentId: string): Promise<ICategory[]> {
    return CategoryModel.find({ parentId, isActive: true }).populate('parentId', 'name slug');
  }
} 