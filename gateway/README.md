# E-commerce API Gateway

A comprehensive API Gateway for the E-commerce Microservices architecture, built with Express.js and TypeScript. This gateway serves as the single entry point for all client requests, providing routing, authentication, rate limiting, circuit breaking, and monitoring capabilities.

## 🚀 Features

### Core Functionality
- **Service Routing**: Routes requests to appropriate microservices
- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Rate Limiting**: Configurable rate limiting with different strategies
- **Circuit Breaker**: Automatic circuit breaker for service resilience
- **Load Balancing**: Intelligent request distribution
- **Request/Response Transformation**: Header injection and request modification

### Security
- **Helmet.js**: Security headers and protection
- **CORS**: Configurable cross-origin resource sharing
- **Input Validation**: Request validation and sanitization
- **Rate Limiting**: Protection against abuse and DDoS

### Monitoring & Observability
- **Prometheus Metrics**: Comprehensive metrics collection
- **Health Checks**: Service health monitoring
- **Request Tracing**: Request ID propagation
- **Structured Logging**: Winston-based logging with multiple transports
- **API Documentation**: Swagger/OpenAPI documentation

### Performance
- **Compression**: Response compression
- **Caching**: Redis-based caching (optional)
- **Connection Pooling**: Optimized connection management
- **Graceful Shutdown**: Proper resource cleanup

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Docker (for containerized deployment)
- Redis (optional, for caching)

## 🛠️ Installation

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ecommerce-microservices/gateway
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

4. **Build the application**
   ```bash
   npm run build
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

### Docker Deployment

1. **Build the Docker image**
   ```bash
   docker build -t ecommerce-gateway .
   ```

2. **Run the container**
   ```bash
   docker run -p 3000:3000 --env-file .env ecommerce-gateway
   ```

## ⚙️ Configuration

### Environment Variables

```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Microservices URLs
AUTH_SERVICE_URL=http://localhost:3001
USER_SERVICE_URL=http://localhost:3002
PRODUCT_SERVICE_URL=http://localhost:3003
ORDER_SERVICE_URL=http://localhost:3004
PAYMENT_SERVICE_URL=http://localhost:3005
NOTIFICATION_SERVICE_URL=http://localhost:3006
REVIEW_SERVICE_URL=http://localhost:3007
SEARCH_SERVICE_URL=http://localhost:3008
SHIPPING_SERVICE_URL=http://localhost:3009

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Circuit Breaker
CIRCUIT_BREAKER_TIMEOUT=3000
CIRCUIT_BREAKER_ERROR_THRESHOLD_PERCENTAGE=50
CIRCUIT_BREAKER_VOLUME_THRESHOLD=10

# Monitoring
ENABLE_METRICS=true
METRICS_PORT=9090
```

## 🚀 API Endpoints

### Health & Monitoring
- `GET /health` - Gateway health check
- `GET /metrics` - Prometheus metrics
- `GET /api/health/services` - All services health check
- `GET /api/stats/services` - Service statistics (admin only)

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/addresses` - Get user addresses
- `POST /api/users/addresses` - Add user address

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create category (admin)
- `PUT /api/categories/:id` - Update category (admin)

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/cancel` - Cancel order

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart/items` - Add item to cart
- `PUT /api/cart/items/:id` - Update cart item
- `DELETE /api/cart/items/:id` - Remove item from cart

### Payments
- `POST /api/payments/process` - Process payment
- `GET /api/payments/:id` - Get payment details
- `POST /api/payments/refund` - Process refund

### Reviews
- `GET /api/reviews/product/:productId` - Get product reviews
- `POST /api/reviews` - Create review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

### Search
- `GET /api/search` - Search products
- `GET /api/search/suggestions` - Get search suggestions
- `GET /api/search/facets` - Get search facets

### Shipping
- `POST /api/shipping/rates` - Get shipping rates
- `POST /api/shipping/shipments` - Create shipment
- `GET /api/shipping/shipments/:id` - Get shipment details
- `GET /api/shipping/shipments/:id/tracking` - Track shipment

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `DELETE /api/notifications/:id` - Delete notification

## 🔐 Authentication

The API Gateway uses JWT tokens for authentication. Include the token in the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

### User Roles
- `customer` - Regular customer access
- `admin` - Administrative access
- `moderator` - Moderator access

## 📊 Monitoring

### Metrics
The gateway exposes Prometheus metrics at `/metrics`:

- HTTP request counts and durations
- Circuit breaker states
- Service health status
- Rate limiting violations
- Authentication failures
- Memory and CPU usage

### Health Checks
- Gateway health: `GET /health`
- Service health: `GET /api/health/services`
- Service statistics: `GET /api/stats/services`

## 🛡️ Security Features

### Rate Limiting
- Global rate limiting for all requests
- Specific limits for authentication endpoints
- Search-specific rate limiting
- Upload-specific rate limiting

### Circuit Breaker
- Automatic circuit breaker for each service
- Configurable error thresholds
- Automatic recovery mechanisms
- Manual reset capabilities

### Security Headers
- Helmet.js for security headers
- CORS configuration
- Content Security Policy
- XSS protection

## 🚀 Deployment

### Docker Compose
```yaml
version: '3.8'
services:
  gateway:
    build: ./gateway
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - redis
    networks:
      - ecommerce-network

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    networks:
      - ecommerce-network

networks:
  ecommerce-network:
    driver: bridge
```

### Kubernetes
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ecommerce-gateway
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ecommerce-gateway
  template:
    metadata:
      labels:
        app: ecommerce-gateway
    spec:
      containers:
      - name: gateway
        image: ecommerce-gateway:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

## 🧪 Testing

### Run tests
```bash
npm test
```

### Run linting
```bash
npm run lint
```

### Run linting with auto-fix
```bash
npm run lint:fix
```

## 📝 Logging

The gateway uses Winston for structured logging with multiple transports:

- Console logging for development
- File logging for production
- Error-specific log files
- Request/response logging

### Log Levels
- `error` - Error messages
- `warn` - Warning messages
- `info` - Informational messages
- `http` - HTTP request logs
- `debug` - Debug messages (development only)

## 🔧 Development

### Project Structure
```
gateway/
├── src/
│   ├── middleware/
│   │   ├── auth.ts
│   │   └── rateLimiter.ts
│   ├── routes/
│   │   └── index.ts
│   ├── services/
│   │   └── proxyService.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   ├── logger.ts
│   │   └── metrics.ts
│   └── index.ts
├── logs/
├── Dockerfile
├── package.json
├── tsconfig.json
└── README.md
```

### Adding New Services
1. Add service configuration to `ProxyService.initializeServices()`
2. Add route configuration in `routes/index.ts`
3. Update environment variables
4. Update health check endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API documentation at `/api-docs`

## 🔄 Version History

- **v1.0.0** - Initial release with core functionality
- Circuit breaker implementation
- Rate limiting and security features
- Monitoring and metrics collection
- Comprehensive API documentation 