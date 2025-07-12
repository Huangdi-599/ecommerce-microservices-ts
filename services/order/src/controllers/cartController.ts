import { Request, Response, NextFunction } from 'express';
import { CartService } from '../services/cartService';

export class CartController {
  private cartService = new CartService();

  getCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.userId;
      const cart = await this.cartService.getCart(userId);
      res.json({ success: true, data: { cart } });
    } catch (error) {
      next(error);
    }
  };

  addToCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.userId;
      const { productId, quantity, price, name } = req.body;
      
      const cart = await this.cartService.addToCart(userId, {
        productId,
        quantity,
        price,
        name,
      });
      
      res.json({
        success: true,
        data: { cart },
        message: 'Item added to cart',
      });
    } catch (error) {
      next(error);
    }
  };

  updateCartItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.userId;
      const { itemId } = req.params;
      const { quantity } = req.body;
      
      const cart = await this.cartService.updateCartItem(userId, itemId, quantity);
      
      res.json({
        success: true,
        data: { cart },
        message: 'Cart item updated',
      });
    } catch (error) {
      next(error);
    }
  };

  removeFromCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.userId;
      const { itemId } = req.params;
      
      const cart = await this.cartService.removeFromCart(userId, itemId);
      
      res.json({
        success: true,
        data: { cart },
        message: 'Item removed from cart',
      });
    } catch (error) {
      next(error);
    }
  };

  clearCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.userId;
      await this.cartService.clearCart(userId);
      
      res.json({
        success: true,
        message: 'Cart cleared',
      });
    } catch (error) {
      next(error);
    }
  };

  getCartTotal = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.userId;
      const total = await this.cartService.getCartTotal(userId);
      
      res.json({
        success: true,
        data: { total },
      });
    } catch (error) {
      next(error);
    }
  };
} 