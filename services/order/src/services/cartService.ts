import { CartModel, ICart } from '../models/Cart';
import { createError } from 'shared-utils';
import { OrderItem } from 'shared-utils';

export class CartService {
  async getCart(userId: string): Promise<ICart> {
    let cart = await CartModel.findOne({ userId }).populate('items.productId');
    if (!cart) {
      cart = new CartModel({ userId, items: [] });
      await cart.save();
    }
    return cart;
  }

  async addToCart(userId: string, item: OrderItem): Promise<ICart> {
    let cart = await CartModel.findOne({ userId });
    if (!cart) {
      cart = new CartModel({ userId, items: [] });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      cartItem => cartItem.productId.toString() === item.productId
    );

    if (existingItemIndex > -1) {
      // Update quantity if item exists
      cart.items[existingItemIndex].quantity += item.quantity;
    } else {
      // Add new item
      cart.items.push(item);
    }

    await cart.save();
    return cart.populate('items.productId');
  }

  async updateCartItem(userId: string, itemId: string, quantity: number): Promise<ICart> {
    const cart = await CartModel.findOne({ userId });
    if (!cart) {
      throw createError('Cart not found', 404);
    }

    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === itemId
    );

    if (itemIndex === -1) {
      throw createError('Item not found in cart', 404);
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      cart.items.splice(itemIndex, 1);
    } else {
      // Update quantity
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();
    return cart.populate('items.productId');
  }

  async removeFromCart(userId: string, itemId: string): Promise<ICart> {
    const cart = await CartModel.findOne({ userId });
    if (!cart) {
      throw createError('Cart not found', 404);
    }

    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === itemId
    );

    if (itemIndex === -1) {
      throw createError('Item not found in cart', 404);
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();
    return cart.populate('items.productId');
  }

  async clearCart(userId: string): Promise<void> {
    await CartModel.findOneAndUpdate(
      { userId },
      { items: [] },
      { new: true }
    );
  }

  async getCartTotal(userId: string): Promise<number> {
    const cart = await this.getCart(userId);
    return cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }
} 