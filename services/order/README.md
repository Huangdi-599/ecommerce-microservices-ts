# Order Service

Manages shopping cart, order creation, and order history for the e-commerce platform.

## Features
- Shopping cart management (add, update, remove items)
- Order creation and order history
- JWT authentication for all endpoints

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas
- Docker (optional)

### Local Development
1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up environment variables:
   ```bash
   cp env.example .env
   # Edit .env with your MongoDB Atlas connection string and JWT secret
   ```
3. Build shared utilities:
   ```bash
   cd ../../shared-utils
   npm install
   npm run build
   cd ../../services/order
   ```
4. Start development server:
   ```bash
   npm run dev
   ```

### Docker
```bash
# Build image
docker build -t order-service .
# Run container
docker run -p 3004:3004 --env-file .env order-service
```

## Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3004` |
| `NODE_ENV` | Environment | `development` |
| `MONGODB_URI` | MongoDB Atlas connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |

## API Endpoints

### Cart
- `GET /api/cart` — Get current user's cart
- `POST /api/cart` — Add item to cart
- `PUT /api/cart/:itemId` — Update cart item
- `DELETE /api/cart/:itemId` — Remove item from cart
- `DELETE /api/cart` — Clear cart

### Orders
- `GET /api/orders` — List user's orders
- `POST /api/orders` — Create order from cart
- `GET /api/orders/:id` — Get order by ID

## Health Check
- `GET /health` — Service health status

## Error Responses
All endpoints return consistent error responses:
```json
{
  "success": false,
  "error": "Error message",
  "details": []
}
```

## Docker Compose
```yaml
order-service:
  build: ./services/order
  ports:
    - "3004:3004"
  environment:
    - MONGODB_URI=mongodb://mongo:27017/order-service
    - JWT_SECRET=your-secret-key
```

## Kubernetes
See `k8s-manifests/` for deployment configs. 