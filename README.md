# E-commerce Microservices Platform

A complete, scalable e-commerce microservices architecture built with Express.js, TypeScript, and modern cloud-native technologies. This platform provides a robust foundation for building enterprise-grade e-commerce applications.

## 🏗️ Architecture Overview

### Microservices Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │   Load Balancer │
│   (React/Vue)   │◄──►│   (Port 3000)   │◄──►│   (Nginx)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
        ┌───────▼──────┐ ┌─────▼─────┐ ┌──────▼──────┐
        │   Auth       │ │   User    │ │   Product   │
        │ (Port 3001)  │ │(Port 3002)│ │(Port 3003)  │
        └──────────────┘ └───────────┘ └─────────────┘
                │               │               │
        ┌───────▼──────┐ ┌─────▼─────┐ ┌──────▼──────┐
        │   Order      │ │  Payment  │ │ Notification │
        │ (Port 3004)  │ │(Port 3005)│ │(Port 3006)  │
        └──────────────┘ └───────────┘ └─────────────┘
                │               │               │
        ┌───────▼──────┐ ┌─────▼─────┐ ┌──────▼──────┐
        │   Review     │ │   Search  │ │   Shipping  │
        │ (Port 3007)  │ │(Port 3008)│ │(Port 3009)  │
        └──────────────┘ └───────────┘ └─────────────┘
                │               │               │
        ┌───────▼───────────────▼───────────────▼──────┐
        │              Infrastructure                  │
        │  ┌─────────┐ ┌─────────┐ ┌─────────────┐  │
        │  │ MongoDB │ │  Redis  │ │Elasticsearch│  │
        │  └─────────┘ └─────────┘ └─────────────┘  │
        └─────────────────────────────────────────────┘
```

## 🚀 Features

### Core Microservices
- **🔐 Authentication Service** - JWT-based authentication, user registration, login/logout
- **👤 User Service** - User profiles, addresses, preferences management
- **📦 Product Service** - Product catalog, categories, inventory management
- **🛒 Order Service** - Order processing, cart management, order history
- **💳 Payment Service** - Payment processing, refunds, multiple payment methods
- **📧 Notification Service** - Email notifications, SMS, push notifications
- **⭐ Review Service** - Product reviews, ratings, moderation
- **🔍 Search Service** - Advanced search with Elasticsearch, faceted search
- **🚚 Shipping Service** - Multi-carrier shipping, tracking, rate calculation

### API Gateway Features
- **🛡️ Security** - JWT authentication, rate limiting, CORS, Helmet.js
- **⚡ Performance** - Circuit breaker, load balancing, compression
- **📊 Monitoring** - Prometheus metrics, health checks, request tracing
- **📚 Documentation** - Swagger/OpenAPI documentation
- **🔧 Configuration** - Environment-based configuration, service discovery

### Infrastructure
- **🗄️ MongoDB** - Primary database with separate collections per service
- **⚡ Redis** - Caching, session storage, rate limiting
- **🔍 Elasticsearch** - Search indexing and advanced search capabilities
- **📈 Prometheus** - Metrics collection and monitoring
- **📊 Grafana** - Visualization and dashboards
- **🐳 Docker** - Containerization and orchestration
- **☸️ Kubernetes** - Production deployment (manifests included)

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety and development experience
- **MongoDB** - NoSQL database
- **Redis** - In-memory cache
- **Elasticsearch** - Search engine
- **JWT** - Authentication

### DevOps & Monitoring
- **Docker** - Containerization
- **Docker Compose** - Local development orchestration
- **Kubernetes** - Production orchestration
- **Prometheus** - Metrics collection
- **Grafana** - Monitoring dashboards
- **Nginx** - Load balancer

### External Services
- **Cloudinary** - Media storage and CDN
- **Stripe** - Payment processing
- **SendGrid** - Email delivery
- **FedEx/UPS/DHL** - Shipping carriers

## 📋 Prerequisites

- **Node.js** 18+ 
- **Docker** and **Docker Compose**
- **Git**
- **MongoDB Atlas** account (optional)
- **Cloudinary** account (optional)
- **Stripe** account (optional)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd ecommerce-microservices
```

### 2. Environment Setup
```bash
# Copy environment files for each service
cp gateway/env.example gateway/.env
cp services/auth/env.example services/auth/.env
cp services/user/env.example services/user/.env
cp services/product/env.example services/product/.env
cp services/order/env.example services/order/.env
cp services/payment/env.example services/payment/.env
cp services/notification/env.example services/notification/.env
cp services/review/env.example services/review/.env
cp services/search/env.example services/search/.env
cp services/shipping/env.example services/shipping/.env
```

### 3. Configure Environment Variables
Edit each `.env` file with your configuration:
- Database connection strings
- JWT secrets
- External service API keys
- Service URLs

### 4. Start with Docker Compose
```bash
# Build and start all services
docker-compose up --build

# Or start in detached mode
docker-compose up -d --build
```

### 5. Access the Services
- **API Gateway**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api-docs
- **Grafana Dashboard**: http://localhost:3001 (admin/admin)
- **Prometheus**: http://localhost:9090
- **Kibana**: http://localhost:5601

## 📚 API Documentation

### Authentication Endpoints
```bash
# Register a new user
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}

# Login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Product Endpoints
```bash
# Get all products
GET /api/products?page=1&limit=10&category=electronics

# Get product by ID
GET /api/products/64f1a2b3c4d5e6f7g8h9i0j1

# Create product (admin only)
POST /api/products
Authorization: Bearer <admin-token>
{
  "name": "iPhone 15 Pro",
  "description": "Latest iPhone model",
  "price": 999.99,
  "category": "electronics",
  "stock": 50
}
```

### Order Endpoints
```bash
# Create order
POST /api/orders
Authorization: Bearer <user-token>
{
  "items": [
    {
      "productId": "64f1a2b3c4d5e6f7g8h9i0j1",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001"
  }
}
```

## 🏗️ Development

### Local Development Setup

1. **Install Dependencies**
   ```bash
   # Install shared utilities
   cd shared-utils && npm install
   
   # Install gateway dependencies
   cd ../gateway && npm install
   
   # Install service dependencies
   cd ../services/auth && npm install
   cd ../services/user && npm install
   # ... repeat for all services
   ```

2. **Start Individual Services**
   ```bash
   # Start MongoDB and Redis
   docker-compose up mongodb redis -d
   
   # Start services individually
   cd services/auth && npm run dev
   cd services/user && npm run dev
   # ... start other services
   
   # Start gateway
   cd gateway && npm run dev
   ```

### Testing
```bash
# Run tests for all services
npm run test

# Run tests for specific service
cd services/auth && npm test

# Run linting
npm run lint

# Run linting with auto-fix
npm run lint:fix
```

## 🚀 Deployment

### Docker Compose (Development/Staging)
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Kubernetes (Production)

1. **Build and Push Images**
   ```bash
   # Build images
   docker build -t your-registry/gateway:latest ./gateway
   docker build -t your-registry/auth:latest ./services/auth
   # ... build other services
   
   # Push to registry
   docker push your-registry/gateway:latest
   docker push your-registry/auth:latest
   # ... push other services
   ```

2. **Deploy to Kubernetes**
   ```bash
   # Apply Kubernetes manifests
   kubectl apply -f k8s-manifests/
   
   # Check deployment status
   kubectl get pods
   kubectl get services
   ```

### AWS EKS Deployment

1. **Create EKS Cluster**
   ```bash
   eksctl create cluster --name ecommerce-cluster --region us-west-2
   ```

2. **Deploy Services**
   ```bash
   kubectl apply -f k8s-manifests/
   ```

3. **Configure Load Balancer**
   ```bash
   kubectl apply -f k8s-manifests/ingress/
   ```

## 📊 Monitoring & Observability

### Metrics Collection
- **Prometheus** collects metrics from all services
- **Grafana** provides visualization dashboards
- **Custom metrics** for business KPIs

### Health Checks
- Service health endpoints: `/health`
- Gateway health: `GET /health`
- Service status: `GET /api/health/services`

### Logging
- **Winston** for structured logging
- **Request tracing** with unique IDs
- **Centralized logging** (ELK stack ready)

## 🔒 Security Features

### Authentication & Authorization
- **JWT-based authentication**
- **Role-based access control** (customer, admin, moderator)
- **Token refresh mechanism**
- **Secure password hashing**

### API Security
- **Rate limiting** per endpoint
- **CORS configuration**
- **Helmet.js** security headers
- **Input validation** and sanitization

### Data Protection
- **Environment-based secrets**
- **Encrypted communication** (HTTPS)
- **Database connection security**

## 🔧 Configuration

### Environment Variables
Each service has its own environment configuration:

```bash
# Common variables
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://localhost:27017/ecommerce
REDIS_HOST=localhost
REDIS_PORT=6379

# Service-specific variables
JWT_SECRET=your-super-secret-jwt-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
STRIPE_SECRET_KEY=your-stripe-secret-key
```

### Service Discovery
- **Static configuration** for development
- **Kubernetes service discovery** for production
- **Health check-based** service discovery

## 🧪 Testing

### Unit Tests
```bash
# Run unit tests
npm test

# Run with coverage
npm run test:coverage
```

### Integration Tests
```bash
# Run integration tests
npm run test:integration
```

### Load Testing
```bash
# Run load tests with Artillery
npm run test:load
```

## 📈 Performance Optimization

### Caching Strategy
- **Redis caching** for frequently accessed data
- **CDN** for static assets
- **Database query optimization**

### Scaling Strategies
- **Horizontal scaling** with Kubernetes
- **Load balancing** across service instances
- **Database sharding** for large datasets

### Performance Monitoring
- **Response time tracking**
- **Throughput monitoring**
- **Resource utilization** tracking

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Add tests** for new functionality
5. **Run the test suite**
   ```bash
   npm test
   ```
6. **Submit a pull request**

### Development Guidelines
- Follow **TypeScript** best practices
- Write **comprehensive tests**
- Update **documentation** for new features
- Follow **conventional commits**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- **API Documentation**: Available at `/api-docs` when gateway is running
- **Service Documentation**: Each service has its own README
- **Architecture Guide**: See `docs/architecture.md`

### Getting Help
- **Create an issue** for bugs or feature requests
- **Check existing issues** for solutions
- **Review the documentation** for setup guides

### Community
- **Discussions**: Use GitHub Discussions
- **Code Reviews**: Submit pull requests
- **Contributions**: Welcome all contributions

## 🔄 Version History

### v1.0.0 (Current)
- Complete microservices architecture
- API Gateway with routing and security
- All core e-commerce services
- Docker and Kubernetes deployment
- Monitoring and observability
- Comprehensive documentation

### Roadmap
- **v1.1.0**: Advanced analytics and reporting
- **v1.2.0**: Multi-tenant support
- **v1.3.0**: AI-powered recommendations
- **v2.0.0**: Event-driven architecture

## 🙏 Acknowledgments

- **Express.js** team for the excellent web framework
- **MongoDB** for the flexible database
- **Docker** for containerization
- **Kubernetes** for orchestration
- **Prometheus** and **Grafana** for monitoring

---

**Built with ❤️ for scalable e-commerce solutions** 