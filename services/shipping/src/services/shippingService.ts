import { Shipment, IShipment } from '../models/Shipment';
import mongoose from 'mongoose';
import axios from 'axios';

export interface CreateShipmentData {
  orderId: string;
  userId: string;
  carrier: 'fedex' | 'ups' | 'dhl' | 'usps';
  service: string;
  originAddress: {
    name: string;
    company?: string;
    street1: string;
    street2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  destinationAddress: {
    name: string;
    company?: string;
    street1: string;
    street2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  packages: Array<{
    weight: number;
    length: number;
    width: number;
    height: number;
    description: string;
  }>;
  insuranceAmount?: number;
  notes?: string;
}

export interface ShippingRateRequest {
  originAddress: {
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  destinationAddress: {
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  packages: Array<{
    weight: number;
    length: number;
    width: number;
    height: number;
  }>;
  service?: string;
}

export interface ShippingRate {
  carrier: string;
  service: string;
  rate: number;
  deliveryDays: number;
  estimatedDeliveryDate: Date;
}

export interface TrackingEvent {
  timestamp: Date;
  location: string;
  status: string;
  description: string;
}

export class ShippingService {
  /**
   * Create a new shipment
   */
  async createShipment(data: CreateShipmentData): Promise<IShipment> {
    try {
      // Validate order exists
      const orderResponse = await axios.get(
        `${process.env.ORDER_SERVICE_URL}/api/orders/${data.orderId}`
      );
      
      if (!orderResponse.data) {
        throw new Error('Order not found');
      }

      // Validate user exists
      const userResponse = await axios.get(
        `${process.env.USER_SERVICE_URL}/api/users/${data.userId}`
      );
      
      if (!userResponse.data) {
        throw new Error('User not found');
      }

      // Get shipping rates
      const rates = await this.getShippingRates({
        originAddress: data.originAddress,
        destinationAddress: data.destinationAddress,
        packages: data.packages,
        service: data.service
      });

      const selectedRate = rates.find(rate => 
        rate.carrier === data.carrier && rate.service === data.service
      );

      if (!selectedRate) {
        throw new Error('Selected shipping service not available');
      }

      // Calculate insurance cost
      const insuranceCost = data.insuranceAmount ? 
        this.calculateInsuranceCost(data.insuranceAmount) : 0;

      // Generate tracking number
      const trackingNumber = await this.generateTrackingNumber(data.carrier);

      // Create shipment
      const shipment = new Shipment({
        orderId: new mongoose.Types.ObjectId(data.orderId),
        userId: new mongoose.Types.ObjectId(data.userId),
        carrier: data.carrier,
        service: data.service,
        trackingNumber,
        originAddress: data.originAddress,
        destinationAddress: data.destinationAddress,
        packages: data.packages,
        shippingCost: selectedRate.rate,
        insuranceCost,
        totalCost: selectedRate.rate + insuranceCost,
        estimatedDeliveryDate: selectedRate.estimatedDeliveryDate,
        notes: data.notes
      });

      return await shipment.save();
    } catch (error) {
      console.error('❌ Failed to create shipment:', error);
      throw error;
    }
  }

  /**
   * Get shipment by ID
   */
  async getShipmentById(shipmentId: string): Promise<IShipment | null> {
    return await Shipment.findById(shipmentId)
      .populate('orderId', 'orderNumber total')
      .populate('userId', 'name email');
  }

  /**
   * Get shipments with filters
   */
  async getShipments(filters: {
    userId?: string;
    orderId?: string;
    carrier?: string;
    status?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{
    shipments: IShipment[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const {
      userId,
      orderId,
      carrier,
      status,
      page = 1,
      limit = 10
    } = filters;

    const query: any = {};

    if (userId) {
      query.userId = new mongoose.Types.ObjectId(userId);
    }

    if (orderId) {
      query.orderId = new mongoose.Types.ObjectId(orderId);
    }

    if (carrier) {
      query.carrier = carrier;
    }

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [shipments, total] = await Promise.all([
      Shipment.find(query)
        .populate('orderId', 'orderNumber total')
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Shipment.countDocuments(query)
    ]);

    return {
      shipments,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Get shipping rates
   */
  async getShippingRates(request: ShippingRateRequest): Promise<ShippingRate[]> {
    try {
      const rates: ShippingRate[] = [];

      // Get rates from different carriers
      const [fedexRates, upsRates, dhlRates] = await Promise.allSettled([
        this.getFedexRates(request),
        this.getUpsRates(request),
        this.getDhlRates(request)
      ]);

      if (fedexRates.status === 'fulfilled') {
        rates.push(...fedexRates.value);
      }

      if (upsRates.status === 'fulfilled') {
        rates.push(...upsRates.value);
      }

      if (dhlRates.status === 'fulfilled') {
        rates.push(...dhlRates.value);
      }

      return rates.sort((a, b) => a.rate - b.rate);
    } catch (error) {
      console.error('❌ Failed to get shipping rates:', error);
      throw error;
    }
  }

  /**
   * Update shipment status
   */
  async updateShipmentStatus(
    shipmentId: string,
    status: 'pending' | 'shipped' | 'delivered' | 'returned' | 'lost',
    trackingEvents?: TrackingEvent[]
  ): Promise<IShipment | null> {
    try {
      const shipment = await Shipment.findById(shipmentId);

      if (!shipment) {
        throw new Error('Shipment not found');
      }

      shipment.status = status;

      if (trackingEvents) {
        shipment.trackingEvents = trackingEvents;
      }

      if (status === 'delivered' && !shipment.actualDeliveryDate) {
        shipment.actualDeliveryDate = new Date();
      }

      return await shipment.save();
    } catch (error) {
      console.error('❌ Failed to update shipment status:', error);
      throw error;
    }
  }

  /**
   * Get tracking information
   */
  async getTrackingInfo(trackingNumber: string): Promise<{
    shipment: IShipment;
    trackingEvents: TrackingEvent[];
  } | null> {
    try {
      const shipment = await Shipment.findOne({ trackingNumber })
        .populate('orderId', 'orderNumber total')
        .populate('userId', 'name email');

      if (!shipment) {
        return null;
      }

      // Get real-time tracking from carrier
      const trackingEvents = await this.getCarrierTracking(trackingNumber, shipment.carrier);

      // Update shipment with latest tracking events
      if (trackingEvents.length > 0) {
        shipment.trackingEvents = trackingEvents;
        await shipment.save();
      }

      return {
        shipment,
        trackingEvents: shipment.trackingEvents
      };
    } catch (error) {
      console.error('❌ Failed to get tracking info:', error);
      throw error;
    }
  }

  /**
   * Generate shipping label
   */
  async generateLabel(shipmentId: string): Promise<{
    labelUrl: string;
    returnLabelUrl?: string;
  }> {
    try {
      const shipment = await Shipment.findById(shipmentId);

      if (!shipment) {
        throw new Error('Shipment not found');
      }

      // Generate label from carrier
      const labelData = await this.generateCarrierLabel(shipment);

      // Update shipment with label URLs
      shipment.labelUrl = labelData.labelUrl;
      shipment.returnLabelUrl = labelData.returnLabelUrl;
      await shipment.save();

      return {
        labelUrl: labelData.labelUrl,
        returnLabelUrl: labelData.returnLabelUrl
      };
    } catch (error) {
      console.error('❌ Failed to generate label:', error);
      throw error;
    }
  }

  /**
   * Get shipment statistics
   */
  async getShipmentStatistics(): Promise<any> {
    try {
      const stats = await Shipment.getStatistics();
      
      // Get additional metrics
      const totalShipments = await Shipment.countDocuments();
      const totalCost = await Shipment.aggregate([
        { $group: { _id: null, total: { $sum: '$totalCost' } } }
      ]);

      return {
        ...stats,
        totalShipments,
        totalCost: totalCost[0]?.total || 0
      };
    } catch (error) {
      console.error('❌ Failed to get shipment statistics:', error);
      throw error;
    }
  }

  /**
   * Validate address
   */
  async validateAddress(address: {
    street1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }): Promise<{
    isValid: boolean;
    suggestions?: any[];
    normalizedAddress?: any;
  }> {
    try {
      // This would typically call a third-party address validation service
      // For now, return a simple validation
      const isValid = address.street1 && address.city && address.state && address.postalCode;
      
      return {
        isValid,
        suggestions: isValid ? [] : [],
        normalizedAddress: isValid ? address : null
      };
    } catch (error) {
      console.error('❌ Failed to validate address:', error);
      throw error;
    }
  }

  /**
   * Get FedEx rates (mock implementation)
   */
  private async getFedexRates(request: ShippingRateRequest): Promise<ShippingRate[]> {
    // Mock implementation - replace with actual FedEx API
    const baseRate = 15.99;
    const weightFactor = request.packages.reduce((sum, pkg) => sum + pkg.weight, 0) * 0.5;
    
    return [
      {
        carrier: 'fedex',
        service: 'Ground',
        rate: baseRate + weightFactor,
        deliveryDays: 3,
        estimatedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      },
      {
        carrier: 'fedex',
        service: 'Express',
        rate: baseRate + weightFactor + 10,
        deliveryDays: 1,
        estimatedDeliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    ];
  }

  /**
   * Get UPS rates (mock implementation)
   */
  private async getUpsRates(request: ShippingRateRequest): Promise<ShippingRate[]> {
    // Mock implementation - replace with actual UPS API
    const baseRate = 14.99;
    const weightFactor = request.packages.reduce((sum, pkg) => sum + pkg.weight, 0) * 0.4;
    
    return [
      {
        carrier: 'ups',
        service: 'Ground',
        rate: baseRate + weightFactor,
        deliveryDays: 3,
        estimatedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      },
      {
        carrier: 'ups',
        service: 'Next Day Air',
        rate: baseRate + weightFactor + 15,
        deliveryDays: 1,
        estimatedDeliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    ];
  }

  /**
   * Get DHL rates (mock implementation)
   */
  private async getDhlRates(request: ShippingRateRequest): Promise<ShippingRate[]> {
    // Mock implementation - replace with actual DHL API
    const baseRate = 16.99;
    const weightFactor = request.packages.reduce((sum, pkg) => sum + pkg.weight, 0) * 0.6;
    
    return [
      {
        carrier: 'dhl',
        service: 'Express',
        rate: baseRate + weightFactor,
        deliveryDays: 2,
        estimatedDeliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
      }
    ];
  }

  /**
   * Get carrier tracking (mock implementation)
   */
  private async getCarrierTracking(trackingNumber: string, carrier: string): Promise<TrackingEvent[]> {
    // Mock implementation - replace with actual carrier API
    return [
      {
        timestamp: new Date(),
        location: 'Distribution Center',
        status: 'In Transit',
        description: 'Package has left the distribution center'
      }
    ];
  }

  /**
   * Generate carrier label (mock implementation)
   */
  private async generateCarrierLabel(shipment: IShipment): Promise<{
    labelUrl: string;
    returnLabelUrl?: string;
  }> {
    // Mock implementation - replace with actual carrier API
    return {
      labelUrl: `https://example.com/labels/${shipment.trackingNumber}.pdf`,
      returnLabelUrl: `https://example.com/return-labels/${shipment.trackingNumber}.pdf`
    };
  }

  /**
   * Generate tracking number
   */
  private async generateTrackingNumber(carrier: string): Promise<string> {
    const prefix = carrier.toUpperCase();
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `${prefix}${timestamp}${random}`.toUpperCase();
  }

  /**
   * Calculate insurance cost
   */
  private calculateInsuranceCost(amount: number): number {
    // Simple insurance calculation - replace with actual logic
    return amount * 0.01; // 1% of declared value
  }
} 