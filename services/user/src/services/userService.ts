import { UserModel, IUser } from '../models/User';
import { AddressModel, IAddress } from '../models/Address';
import { PreferencesModel, IPreferences } from '../models/Preferences';
import { createError } from 'shared-utils';

export class UserService {
  async getProfile(userId: string) {
    const user = await UserModel.findById(userId).populate('addresses').populate('preferences').select('-password');
    if (!user) throw createError('User not found', 404);
    return user;
  }

  async updateProfile(userId: string, updateData: Partial<IUser>) {
    const { password, ...safeUpdateData } = updateData;
    const user = await UserModel.findByIdAndUpdate(userId, safeUpdateData, { new: true, runValidators: true }).select('-password');
    if (!user) throw createError('User not found', 404);
    return user;
  }

  // Address methods
  async listAddresses(userId: string) {
    return AddressModel.find({ userId });
  }
  async addAddress(userId: string, address: Partial<IAddress>) {
    const newAddress = new AddressModel({ ...address, userId });
    await newAddress.save();
    await UserModel.findByIdAndUpdate(userId, { $push: { addresses: newAddress._id } });
    return newAddress;
  }
  async updateAddress(userId: string, addressId: string, update: Partial<IAddress>) {
    const address = await AddressModel.findOneAndUpdate({ _id: addressId, userId }, update, { new: true });
    if (!address) throw createError('Address not found', 404);
    return address;
  }
  async deleteAddress(userId: string, addressId: string) {
    const address = await AddressModel.findOneAndDelete({ _id: addressId, userId });
    if (!address) throw createError('Address not found', 404);
    await UserModel.findByIdAndUpdate(userId, { $pull: { addresses: addressId } });
    return address;
  }

  // Preferences methods
  async getPreferences(userId: string) {
    let prefs = await PreferencesModel.findOne({ userId });
    if (!prefs) {
      prefs = new PreferencesModel({ userId });
      await prefs.save();
    }
    return prefs;
  }
  async updatePreferences(userId: string, update: Partial<IPreferences>) {
    const prefs = await PreferencesModel.findOneAndUpdate({ userId }, update, { new: true, upsert: true });
    return prefs;
  }
} 