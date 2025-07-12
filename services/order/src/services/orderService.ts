import { OrderModel, IOrder } from '../models/Order';
import { CartModel } from '../models/Cart';
import { createError } from 'shared-utils';
import { OrderStatus, PaymentStatus, Address } from 'shared-utils';

export class OrderService {
  async createOrder(userId: string, shippingAddress: Address): Promise<IOrder> {
    // Get user's cart
    const cart = await CartModel.findOne({ userId }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      throw createError('Cart is empty', 400);
    }

    // Calculate total amount
    const totalAmount = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);

    // Create order
    const order = new OrderModel({
      userId,
      items: cart.items,
      totalAmount,
      shippingAddress,
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
    });

    await order.save();

    // Clear cart after order creation
    await CartModel.findOneAndUpdate(
      { userId },
      { items: [] },
      { new: true }
    );

    return order.populate('items.productId');
  }

  async getOrders(userId: string, page: number = 1, limit: number = 10): Promise<{
    orders: IOrder[];
    total: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      OrderModel.find({ userId })
        .populate('items.productId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      OrderModel.countDocuments({ userId }),
    ]);

    return {
      orders,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getOrderById(userId: string, orderId: string): Promise<IOrder> {
    const order = await OrderModel.findOne({ _id: orderId, userId }).populate('items.productId');
    if (!order) {
      throw createError('Order not found', 404);
    }
    return order;
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<IOrder> {
    const order = await OrderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    ).populate('items.productId');

    if (!order) {
      throw createError('Order not found', 404);
    }

    return order;
  }

  async updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus): Promise<IOrder> {
    const order = await OrderModel.findByIdAndUpdate(
      orderId,
      { paymentStatus },
      { new: true }
    ).populate('items.productId');

    if (!order) {
      throw createError('Order not found', 404);
    }

    return order;
  }

  async cancelOrder(userId: string, orderId: string): Promise<IOrder> {
    const order = await OrderModel.findOne({ _id: orderId, userId });
    if (!order) {
      throw createError('Order not found', 404);
    }

    // Only allow cancellation of pending orders
    if (order.status !== OrderStatus.PENDING) {
      throw createError('Cannot cancel order that is not pending', 400);
    }

    order.status = OrderStatus.CANCELLED;
    await order.save();

    return order.populate('items.productId');
  }
} 