import { ProductModel, IProduct } from '../models/Product';
import { CategoryModel, ICategory } from '../models/Category';
import { CloudinaryService } from './cloudinaryService';
import { createError } from 'shared-utils';
import { PaginationParams, PaginatedResponse } from 'shared-utils';

export class ProductService {
  private cloudinaryService = new CloudinaryService();

  async createProduct(productData: Partial<IProduct>): Promise<IProduct> {
    // Verify category exists
    const category = await CategoryModel.findById(productData.categoryId);
    if (!category) {
      throw createError('Category not found', 404);
    }

    const product = new ProductModel({
      ...productData,
      category: category.name,
    });

    return product.save();
  }

  async getProducts(params: PaginationParams = {}): Promise<PaginatedResponse<IProduct>> {
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = params;
    const skip = (page - 1) * limit;

    const query = { isActive: true };
    const sortOptions = { [sort]: order === 'desc' ? -1 : 1 };

    const [products, total] = await Promise.all([
      ProductModel.find(query)
        .populate('categoryId', 'name slug')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit),
      ProductModel.countDocuments(query),
    ]);

    return {
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getProductById(id: string): Promise<IProduct> {
    const product = await ProductModel.findById(id)
      .populate('categoryId', 'name slug')
      .where({ isActive: true });

    if (!product) {
      throw createError('Product not found', 404);
    }

    return product;
  }

  async updateProduct(id: string, updateData: Partial<IProduct>): Promise<IProduct> {
    if (updateData.categoryId) {
      const category = await CategoryModel.findById(updateData.categoryId);
      if (!category) {
        throw createError('Category not found', 404);
      }
      updateData.category = category.name;
    }

    const product = await ProductModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('categoryId', 'name slug');

    if (!product) {
      throw createError('Product not found', 404);
    }

    return product;
  }

  async deleteProduct(id: string): Promise<void> {
    const product = await ProductModel.findByIdAndUpdate(id, { isActive: false });
    if (!product) {
      throw createError('Product not found', 404);
    }
  }

  async uploadProductImages(productId: string, files: Express.Multer.File[]): Promise<IProduct> {
    const product = await ProductModel.findById(productId);
    if (!product) {
      throw createError('Product not found', 404);
    }

    // Upload images to Cloudinary
    const imageUrls = await this.cloudinaryService.uploadMultipleImages(files);

    // Add new images to product
    product.images.push(...imageUrls);
    await product.save();

    return product;
  }

  async deleteProductImage(productId: string, imageUrl: string): Promise<IProduct> {
    const product = await ProductModel.findById(productId);
    if (!product) {
      throw createError('Product not found', 404);
    }

    // Remove image from product
    const imageIndex = product.images.indexOf(imageUrl);
    if (imageIndex === -1) {
      throw createError('Image not found', 404);
    }

    product.images.splice(imageIndex, 1);
    await product.save();

    // Delete from Cloudinary
    const publicId = this.cloudinaryService.extractPublicId(imageUrl);
    if (publicId) {
      await this.cloudinaryService.deleteImage(publicId);
    }

    return product;
  }

  async searchProducts(query: string, params: PaginationParams = {}): Promise<PaginatedResponse<IProduct>> {
    const { page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    const searchQuery = {
      $text: { $search: query },
      isActive: true,
    };

    const [products, total] = await Promise.all([
      ProductModel.find(searchQuery)
        .populate('categoryId', 'name slug')
        .skip(skip)
        .limit(limit),
      ProductModel.countDocuments(searchQuery),
    ]);

    return {
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getProductsByCategory(categoryId: string, params: PaginationParams = {}): Promise<PaginatedResponse<IProduct>> {
    const { page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    const query = { categoryId, isActive: true };

    const [products, total] = await Promise.all([
      ProductModel.find(query)
        .populate('categoryId', 'name slug')
        .skip(skip)
        .limit(limit),
      ProductModel.countDocuments(query),
    ]);

    return {
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
} 