import jwt from 'jsonwebtoken';
import { UserModel, IUser } from '../models/User';
import { createError } from 'shared-utils';
import { UserRole } from 'shared-utils';

export class AuthService {
  async signup(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: UserRole;
  }): Promise<{ user: IUser; token: string; refreshToken: string }> {
    // Check if user already exists
    const existingUser = await UserModel.findOne({ email: userData.email });
    if (existingUser) {
      throw createError('User with this email already exists', 400);
    }

    // Create new user
    const user = new UserModel({
      ...userData,
      role: userData.role || UserRole.USER,
    });

    await user.save();

    // Generate tokens
    const token = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();

    return { user, token, refreshToken };
  }

  async login(email: string, password: string): Promise<{ user: IUser; token: string; refreshToken: string }> {
    // Find user by email
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw createError('Invalid email or password', 401);
    }

    // Check if user is active
    if (!user.isActive) {
      throw createError('Account is deactivated', 401);
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw createError('Invalid email or password', 401);
    }

    // Generate tokens
    const token = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();

    return { user, token, refreshToken };
  }

  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as any;
      
      if (decoded.type !== 'refresh') {
        throw createError('Invalid refresh token', 401);
      }

      const user = await UserModel.findById(decoded.userId);
      if (!user || !user.isActive) {
        throw createError('User not found or inactive', 401);
      }

      const newToken = user.generateAuthToken();
      const newRefreshToken = user.generateRefreshToken();

      return { token: newToken, refreshToken: newRefreshToken };
    } catch (error) {
      throw createError('Invalid refresh token', 401);
    }
  }

  async getUserById(userId: string): Promise<IUser | null> {
    return UserModel.findById(userId).select('-password');
  }

  async updateUser(userId: string, updateData: Partial<IUser>): Promise<IUser | null> {
    // Remove password from update data if present
    const { password, ...safeUpdateData } = updateData;
    
    return UserModel.findByIdAndUpdate(
      userId,
      safeUpdateData,
      { new: true, runValidators: true }
    ).select('-password');
  }

  async deactivateUser(userId: string): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, { isActive: false });
  }

  async activateUser(userId: string): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, { isActive: true });
  }
} 