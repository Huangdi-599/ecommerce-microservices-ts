# Shipping Service

A microservice for managing shipping operations, carrier integrations, and shipment tracking in the e-commerce platform.

## Features

- ✅ Multi-carrier shipping (FedEx, UPS, DHL, USPS)
- ✅ Real-time shipping rate calculation
- ✅ Shipment creation and management
- ✅ Package tracking and status updates
- ✅ Address validation
- ✅ Shipping label generation
- ✅ Insurance and cost calculation
- ✅ Tracking event management
- ✅ Shipment statistics and analytics
- ✅ Rate limiting and security
- ✅ JWT authentication
- ✅ Role-based access control

## API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/shipping/tracking/:trackingNumber` | Get tracking information |
| POST | `/api/shipping/rates` | Get shipping rates |
| POST | `/api/shipping/validate-address` | Validate address |

### Protected Endpoints (Authentication Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/shipping/shipments` | Create a new shipment |
| GET | `/api/shipping/shipments/:id` | Get shipment by ID |
| GET | `/api/shipping/shipments` | Get shipments with filters |
| GET | `/api/shipping/user/shipments` | Get user's shipments |
| GET | `/api/shipping/orders/:orderId/shipments` | Get order shipments |

### Admin Endpoints (Admin Role Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| PATCH | `/api/shipping/shipments/:id/status` | Update shipment status |
| POST | `/api/shipping/shipments/:id/label` | Generate shipping label |
| GET | `/api/shipping/statistics` | Get shipment statistics |

## Request/Response Examples

### Create Shipment

```bash
POST /api/shipping/shipments
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "orderId": "507f1f77bcf86cd799439011",
  "carrier": "fedex",
  "service": "Ground",
  "originAddress": {
    "name": "John Doe",
    "company": "My Company",
    "street1": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "US",
    "phone": "+1234567890"
  },
  "destinationAddress": {
    "name": "Jane Smith",
    "street1": "456 Oak Ave",
    "city": "Los Angeles",
    "state": "CA",
    "postalCode": "90210",
    "country": "US",
    "phone": "+1987654321"
  },
  "packages": [
    {
      "weight": 2.5,
      "length": 10,
      "width": 8,
      "height": 6,
      "description": "Electronics"
    }
  ],
  "insuranceAmount": 500,
  "notes": "Handle with care"
}
```

**Response:**
```json
{
  "message": "Shipment created successfully",
  "shipment": {
    "_id": "507f1f77bcf86cd799439012",
    "orderId": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439013",
    "carrier": "fedex",
    "service": "Ground",
    "trackingNumber": "FEDEX123456789",
    "status": "pending",
    "originAddress": {...},
    "destinationAddress": {...},
    "packages": [...],
    "shippingCost": 15.99,
    "insuranceCost": 5.00,
    "totalCost": 20.99,
    "estimatedDeliveryDate": "2024-01-18T10:30:00.000Z",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Get Shipping Rates

```bash
POST /api/shipping/rates
Content-Type: application/json

{
  "originAddress": {
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "US"
  },
  "destinationAddress": {
    "city": "Los Angeles",
    "state": "CA",
    "postalCode": "90210",
    "country": "US"
  },
  "packages": [
    {
      "weight": 2.5,
      "length": 10,
      "width": 8,
      "height": 6
    }
  ]
}
```

**Response:**
```json
{
  "rates": [
    {
      "carrier": "fedex",
      "service": "Ground",
      "rate": 15.99,
      "deliveryDays": 3,
      "estimatedDeliveryDate": "2024-01-18T10:30:00.000Z"
    },
    {
      "carrier": "fedex",
      "service": "Express",
      "rate": 25.99,
      "deliveryDays": 1,
      "estimatedDeliveryDate": "2024-01-16T10:30:00.000Z"
    },
    {
      "carrier": "ups",
      "service": "Ground",
      "rate": 14.99,
      "deliveryDays": 3,
      "estimatedDeliveryDate": "2024-01-18T10:30:00.000Z"
    }
  ]
}
```

### Get Tracking Information

```bash
GET /api/shipping/tracking/FEDEX123456789
```

**Response:**
```json
{
  "shipment": {
    "_id": "507f1f77bcf86cd799439012",
    "trackingNumber": "FEDEX123456789",
    "status": "shipped",
    "carrier": "fedex",
    "service": "Ground",
    "estimatedDeliveryDate": "2024-01-18T10:30:00.000Z"
  },
  "trackingEvents": [
    {
      "timestamp": "2024-01-15T14:30:00.000Z",
      "location": "New York, NY",
      "status": "Picked up",
      "description": "Package picked up by carrier"
    },
    {
      "timestamp": "2024-01-16T08:15:00.000Z",
      "location": "Memphis, TN",
      "status": "In Transit",
      "description": "Package has left the distribution center"
    }
  ]
}
```

## Environment Variables

```env
# Server Configuration
PORT=3008
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/shipping-service?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h

# Service URLs
AUTH_SERVICE_URL=http://localhost:3001
ORDER_SERVICE_URL=http://localhost:3004
USER_SERVICE_URL=http://localhost:3002

# Shipping Carrier APIs
FEDEX_API_KEY=your-fedex-api-key
FEDEX_API_SECRET=your-fedex-api-secret
FEDEX_ACCOUNT_NUMBER=your-fedex-account-number
FEDEX_METER_NUMBER=your-fedex-meter-number

UPS_API_KEY=your-ups-api-key
UPS_USERNAME=your-ups-username
UPS_PASSWORD=your-ups-password
UPS_ACCOUNT_NUMBER=your-ups-account-number

DHL_API_KEY=your-dhl-api-key
DHL_ACCOUNT_NUMBER=your-dhl-account-number

# Shipping Configuration
DEFAULT_SHIPPING_METHOD=standard
SHIPPING_RATE_CACHE_TTL=3600
ADDRESS_VALIDATION_ENABLED=true
TRACKING_UPDATE_INTERVAL=300

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd services/shipping
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   npm start
   ```

## Docker

### Build Image
```bash
docker build -t shipping-service .
```

### Run Container
```bash
docker run -p 3008:3008 --env-file .env shipping-service
```

### Docker Compose
```yaml
shipping-service:
  build: .
  ports:
    - "3008:3008"
  environment:
    - MONGODB_URI=mongodb://mongo:27017/shipping-service
    - JWT_SECRET=your-secret
  depends_on:
    - mongo
```

## Database Schema

### Shipment Collection

```javascript
{
  _id: ObjectId,
  orderId: ObjectId,        // Reference to Order
  userId: ObjectId,         // Reference to User
  carrier: String,          // 'fedex', 'ups', 'dhl', 'usps'
  service: String,          // Shipping service name
  trackingNumber: String,   // Unique tracking number
  status: String,           // 'pending', 'shipped', 'delivered', 'returned', 'lost'
  originAddress: {
    name: String,
    company: String,
    street1: String,
    street2: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
    phone: String
  },
  destinationAddress: {
    // Same structure as originAddress
  },
  packages: [{
    weight: Number,
    length: Number,
    width: Number,
    height: Number,
    description: String
  }],
  shippingCost: Number,
  insuranceCost: Number,
  totalCost: Number,
  estimatedDeliveryDate: Date,
  actualDeliveryDate: Date,
  shippedAt: Date,
  deliveredAt: Date,
  trackingEvents: [{
    timestamp: Date,
    location: String,
    status: String,
    description: String
  }],
  labelUrl: String,
  returnLabelUrl: String,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Indexes

- `{ orderId: 1, status: 1 }` (for order queries)
- `{ userId: 1, status: 1 }` (for user queries)
- `{ carrier: 1, status: 1 }` (for carrier queries)
- `{ trackingNumber: 1 }` (unique, for tracking)
- `{ estimatedDeliveryDate: 1 }` (for delivery queries)
- `{ createdAt: -1 }` (for recent shipments)

## Carrier Integration

### Supported Carriers

- **FedEx**: Ground, Express, Priority
- **UPS**: Ground, Next Day Air, 2nd Day Air
- **DHL**: Express, Ground
- **USPS**: Priority, First Class, Media Mail

### Rate Calculation

Each carrier provides different rate calculation methods:
- Base rate + weight factor
- Distance-based pricing
- Service level premiums
- Insurance costs

### Tracking Integration

Real-time tracking updates from carrier APIs:
- Package pickup confirmation
- Transit updates
- Delivery confirmation
- Exception handling

## Rate Limiting

- **Shipping Requests**: 100 requests per 15 minutes per IP
- **Admin Requests**: 50 requests per 15 minutes per IP

## Security Features

- ✅ JWT Authentication
- ✅ Role-based Access Control
- ✅ Input Validation
- ✅ Rate Limiting
- ✅ CORS Protection
- ✅ Helmet Security Headers
- ✅ Carrier API Security
- ✅ Address Validation

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

## Monitoring

### Health Check
```bash
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "service": "Shipping Service",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600
}
```

### Metrics
- Shipment creation rate
- Carrier response times
- Tracking update frequency
- Delivery success rates
- Cost analysis

## Dependencies

### Production
- `express`: Web framework
- `mongoose`: MongoDB ODM
- `jsonwebtoken`: JWT authentication
- `cors`: CORS middleware
- `helmet`: Security headers
- `morgan`: HTTP request logger
- `dotenv`: Environment variables
- `express-rate-limit`: Rate limiting
- `axios`: HTTP client for service communication

### Development
- `typescript`: TypeScript compiler
- `nodemon`: Development server
- `jest`: Testing framework
- `eslint`: Code linting

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run linting and tests
6. Submit a pull request

## License

MIT License - see LICENSE file for details. 