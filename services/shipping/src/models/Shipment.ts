import mongoose, { Document, Schema } from 'mongoose';

export interface IShipment extends Document {
  orderId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  carrier: 'fedex' | 'ups' | 'dhl' | 'usps';
  service: string;
  trackingNumber: string;
  status: 'pending' | 'shipped' | 'delivered' | 'returned' | 'lost';
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
  shippingCost: number;
  insuranceCost: number;
  totalCost: number;
  estimatedDeliveryDate: Date;
  actualDeliveryDate?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  trackingEvents: Array<{
    timestamp: Date;
    location: string;
    status: string;
    description: string;
  }>;
  labelUrl?: string;
  returnLabelUrl?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    trim: true
  },
  street1: {
    type: String,
    required: true,
    trim: true
  },
  street2: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  postalCode: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    trim: true,
    default: 'US'
  },
  phone: {
    type: String,
    trim: true
  }
}, { _id: false });

const packageSchema = new Schema({
  weight: {
    type: Number,
    required: true,
    min: 0
  },
  length: {
    type: Number,
    required: true,
    min: 0
  },
  width: {
    type: Number,
    required: true,
    min: 0
  },
  height: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true,
    trim: true
  }
}, { _id: false });

const trackingEventSchema = new Schema({
  timestamp: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  }
}, { _id: false });

const shipmentSchema = new Schema<IShipment>({
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    index: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  carrier: {
    type: String,
    enum: ['fedex', 'ups', 'dhl', 'usps'],
    required: true,
    index: true
  },
  service: {
    type: String,
    required: true,
    trim: true
  },
  trackingNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'shipped', 'delivered', 'returned', 'lost'],
    default: 'pending',
    index: true
  },
  originAddress: {
    type: addressSchema,
    required: true
  },
  destinationAddress: {
    type: addressSchema,
    required: true
  },
  packages: [{
    type: packageSchema,
    required: true
  }],
  shippingCost: {
    type: Number,
    required: true,
    min: 0
  },
  insuranceCost: {
    type: Number,
    default: 0,
    min: 0
  },
  totalCost: {
    type: Number,
    required: true,
    min: 0
  },
  estimatedDeliveryDate: {
    type: Date,
    required: true
  },
  actualDeliveryDate: {
    type: Date
  },
  shippedAt: {
    type: Date
  },
  deliveredAt: {
    type: Date
  },
  trackingEvents: [{
    type: trackingEventSchema
  }],
  labelUrl: {
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Label URL must be a valid HTTP/HTTPS URL'
    }
  },
  returnLabelUrl: {
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Return label URL must be a valid HTTP/HTTPS URL'
    }
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
shipmentSchema.index({ orderId: 1, status: 1 });
shipmentSchema.index({ userId: 1, status: 1 });
shipmentSchema.index({ carrier: 1, status: 1 });
shipmentSchema.index({ estimatedDeliveryDate: 1 });
shipmentSchema.index({ createdAt: -1 });

// Virtual for delivery status
shipmentSchema.virtual('isDelivered').get(function() {
  return this.status === 'delivered';
});

shipmentSchema.virtual('isShipped').get(function() {
  return this.status === 'shipped' || this.status === 'delivered';
});

// Pre-save middleware to update timestamps
shipmentSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'shipped' && !this.shippedAt) {
      this.shippedAt = new Date();
    }
    if (this.status === 'delivered' && !this.deliveredAt) {
      this.deliveredAt = new Date();
    }
  }
  next();
});

// Static method to get shipment statistics
shipmentSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalCost: { $sum: '$totalCost' }
      }
    }
  ]);
  
  const result: any = {
    pending: { count: 0, totalCost: 0 },
    shipped: { count: 0, totalCost: 0 },
    delivered: { count: 0, totalCost: 0 },
    returned: { count: 0, totalCost: 0 },
    lost: { count: 0, totalCost: 0 }
  };
  
  stats.forEach(stat => {
    result[stat._id] = {
      count: stat.count,
      totalCost: stat.totalCost
    };
  });
  
  return result;
};

export const Shipment = mongoose.model<IShipment>('Shipment', shipmentSchema); 