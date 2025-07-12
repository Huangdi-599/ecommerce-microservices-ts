import { Request, Response } from 'express';
import { ShippingService } from '../services/shippingService';
import { validateRequest } from '@/shared/utils/validation';

const shippingService = new ShippingService();

export class ShippingController {
  /**
   * Create a new shipment
   * POST /api/shipping/shipments
   */
  async createShipment(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const shipmentData = {
        ...req.body,
        userId
      };

      // Validate required fields
      const validation = validateRequest(shipmentData, {
        orderId: 'required|string',
        carrier: 'required|string|in:fedex,ups,dhl,usps',
        service: 'required|string',
        originAddress: 'required|object',
        destinationAddress: 'required|object',
        packages: 'required|array'
      });

      if (!validation.isValid) {
        res.status(400).json({ error: 'Validation failed', details: validation.errors });
        return;
      }

      const shipment = await shippingService.createShipment(shipmentData);
      res.status(201).json({
        message: 'Shipment created successfully',
        shipment
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Get shipment by ID
   * GET /api/shipping/shipments/:id
   */
  async getShipmentById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const shipment = await shippingService.getShipmentById(id);

      if (!shipment) {
        res.status(404).json({ error: 'Shipment not found' });
        return;
      }

      res.status(200).json({ shipment });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get shipments with filters
   * GET /api/shipping/shipments
   */
  async getShipments(req: Request, res: Response): Promise<void> {
    try {
      const {
        userId,
        orderId,
        carrier,
        status,
        page,
        limit
      } = req.query;

      const filters = {
        userId: userId as string,
        orderId: orderId as string,
        carrier: carrier as string,
        status: status as string,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10
      };

      const result = await shippingService.getShipments(filters);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get shipping rates
   * POST /api/shipping/rates
   */
  async getShippingRates(req: Request, res: Response): Promise<void> {
    try {
      const { originAddress, destinationAddress, packages, service } = req.body;

      // Validate required fields
      const validation = validateRequest(req.body, {
        originAddress: 'required|object',
        destinationAddress: 'required|object',
        packages: 'required|array'
      });

      if (!validation.isValid) {
        res.status(400).json({ error: 'Validation failed', details: validation.errors });
        return;
      }

      const rates = await shippingService.getShippingRates({
        originAddress,
        destinationAddress,
        packages,
        service
      });

      res.status(200).json({ rates });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Update shipment status
   * PATCH /api/shipping/shipments/:id/status
   */
  async updateShipmentStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status, trackingEvents } = req.body;
      const user = (req as any).user;

      if (!user || user.role !== 'admin') {
        res.status(403).json({ error: 'Admin access required' });
        return;
      }

      if (!['pending', 'shipped', 'delivered', 'returned', 'lost'].includes(status)) {
        res.status(400).json({ error: 'Invalid status' });
        return;
      }

      const shipment = await shippingService.updateShipmentStatus(id, status, trackingEvents);

      if (!shipment) {
        res.status(404).json({ error: 'Shipment not found' });
        return;
      }

      res.status(200).json({
        message: 'Shipment status updated successfully',
        shipment
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Get tracking information
   * GET /api/shipping/tracking/:trackingNumber
   */
  async getTrackingInfo(req: Request, res: Response): Promise<void> {
    try {
      const { trackingNumber } = req.params;

      if (!trackingNumber) {
        res.status(400).json({ error: 'Tracking number is required' });
        return;
      }

      const trackingInfo = await shippingService.getTrackingInfo(trackingNumber);

      if (!trackingInfo) {
        res.status(404).json({ error: 'Tracking information not found' });
        return;
      }

      res.status(200).json(trackingInfo);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Generate shipping label
   * POST /api/shipping/shipments/:id/label
   */
  async generateLabel(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = (req as any).user;

      if (!user || user.role !== 'admin') {
        res.status(403).json({ error: 'Admin access required' });
        return;
      }

      const labelData = await shippingService.generateLabel(id);

      res.status(200).json({
        message: 'Label generated successfully',
        ...labelData
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Get shipment statistics
   * GET /api/shipping/statistics
   */
  async getShipmentStatistics(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;

      if (!user || user.role !== 'admin') {
        res.status(403).json({ error: 'Admin access required' });
        return;
      }

      const statistics = await shippingService.getShipmentStatistics();
      res.status(200).json(statistics);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Validate address
   * POST /api/shipping/validate-address
   */
  async validateAddress(req: Request, res: Response): Promise<void> {
    try {
      const { street1, city, state, postalCode, country } = req.body;

      // Validate required fields
      const validation = validateRequest(req.body, {
        street1: 'required|string',
        city: 'required|string',
        state: 'required|string',
        postalCode: 'required|string',
        country: 'required|string'
      });

      if (!validation.isValid) {
        res.status(400).json({ error: 'Validation failed', details: validation.errors });
        return;
      }

      const result = await shippingService.validateAddress({
        street1,
        city,
        state,
        postalCode,
        country
      });

      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get user's shipments
   * GET /api/shipping/user/shipments
   */
  async getUserShipments(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const {
        page = '1',
        limit = '10',
        status
      } = req.query;

      const filters = {
        userId,
        status: status as string,
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      };

      const result = await shippingService.getShipments(filters);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get order shipments
   * GET /api/shipping/orders/:orderId/shipments
   */
  async getOrderShipments(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;

      if (!orderId) {
        res.status(400).json({ error: 'Order ID is required' });
        return;
      }

      const filters = {
        orderId,
        page: 1,
        limit: 50
      };

      const result = await shippingService.getShipments(filters);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
} 