# Review Service

A microservice for managing product reviews and ratings in the e-commerce platform.

## Features

- ✅ Create, read, update, and delete reviews
- ✅ Product rating system (1-5 stars)
- ✅ Review helpfulness voting
- ✅ Review moderation (approve/reject)
- ✅ Verified purchase reviews
- ✅ Rating aggregation and distribution
- ✅ Image support for reviews
- ✅ Pagination and filtering
- ✅ Rate limiting and security
- ✅ JWT authentication
- ✅ Role-based access control

## API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reviews` | Get reviews with filters |
| GET | `/api/reviews/:id` | Get review by ID |
| GET | `/api/reviews/product/:productId` | Get product reviews with stats |
| GET | `/api/reviews/product/:productId/rating` | Get average rating for product |
| GET | `/api/reviews/product/:productId/distribution` | Get rating distribution |

### Protected Endpoints (Authentication Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reviews` | Create a new review |
| PUT | `/api/reviews/:id` | Update review |
| DELETE | `/api/reviews/:id` | Delete review |
| POST | `/api/reviews/:id/helpful` | Mark review as helpful |
| GET | `/api/reviews/user/me` | Get user's reviews |

### Admin Endpoints (Admin Role Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| PATCH | `/api/reviews/:id/status` | Update review status |
| PATCH | `/api/reviews/:id/verified` | Mark review as verified |

## Request/Response Examples

### Create Review

```bash
POST /api/reviews
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "productId": "507f1f77bcf86cd799439011",
  "orderId": "507f1f77bcf86cd799439012",
  "rating": 5,
  "title": "Great product!",
  "content": "This product exceeded my expectations. Highly recommended!",
  "images": ["https://example.com/image1.jpg"]
}
```

**Response:**
```json
{
  "message": "Review created successfully",
  "review": {
    "_id": "507f1f77bcf86cd799439013",
    "userId": "507f1f77bcf86cd799439014",
    "productId": "507f1f77bcf86cd799439011",
    "rating": 5,
    "title": "Great product!",
    "content": "This product exceeded my expectations. Highly recommended!",
    "images": ["https://example.com/image1.jpg"],
    "helpful": 0,
    "verified": false,
    "status": "pending",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Get Product Reviews

```bash
GET /api/reviews/product/507f1f77bcf86cd799439011?page=1&limit=10&sortBy=createdAt&sortOrder=desc
```

**Response:**
```json
{
  "reviews": [...],
  "total": 150,
  "page": 1,
  "totalPages": 15,
  "averageRating": 4.2,
  "totalReviews": 150,
  "ratingDistribution": {
    "5": 60,
    "4": 45,
    "3": 25,
    "2": 15,
    "1": 5
  }
}
```

## Environment Variables

```env
# Server Configuration
PORT=3006
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/review-service?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h

# Service URLs
AUTH_SERVICE_URL=http://localhost:3001
USER_SERVICE_URL=http://localhost:3002
PRODUCT_SERVICE_URL=http://localhost:3003

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
   cd services/review
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
docker build -t review-service .
```

### Run Container
```bash
docker run -p 3006:3006 --env-file .env review-service
```

### Docker Compose
```yaml
review-service:
  build: .
  ports:
    - "3006:3006"
  environment:
    - MONGODB_URI=mongodb://mongo:27017/review-service
    - JWT_SECRET=your-secret
  depends_on:
    - mongo
```

## Database Schema

### Review Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId,        // Reference to User
  productId: ObjectId,     // Reference to Product
  orderId: ObjectId,       // Optional reference to Order
  rating: Number,          // 1-5 stars
  title: String,           // Review title
  content: String,         // Review content
  images: [String],        // Array of image URLs
  helpful: Number,         // Helpful votes count
  helpfulUsers: [ObjectId], // Users who marked as helpful
  verified: Boolean,       // Verified purchase
  status: String,          // 'pending', 'approved', 'rejected'
  createdAt: Date,
  updatedAt: Date
}
```

## Indexes

- `{ userId: 1, productId: 1 }` (unique compound index)
- `{ productId: 1 }` (for product queries)
- `{ userId: 1 }` (for user queries)
- `{ rating: 1 }` (for rating filters)
- `{ status: 1 }` (for status filters)
- `{ helpful: -1 }` (for helpful sorting)

## Rate Limiting

- **Review Creation**: 5 requests per 15 minutes per IP
- **General API**: 100 requests per 15 minutes per IP

## Security Features

- ✅ JWT Authentication
- ✅ Role-based Access Control
- ✅ Input Validation
- ✅ Rate Limiting
- ✅ CORS Protection
- ✅ Helmet Security Headers
- ✅ SQL Injection Prevention (MongoDB)
- ✅ XSS Protection

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
  "service": "Review Service",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600
}
```

### Metrics
- Review creation rate
- Average response time
- Error rates
- Database connection status

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