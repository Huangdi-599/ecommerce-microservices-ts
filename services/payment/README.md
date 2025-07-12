# Payment Service

Handles payment processing for the e-commerce platform, using Stripe (test mode) or simulation.

## Features
- Create payment intents (Stripe test mode or simulation)
- Update order payment status
- JWT authentication for all endpoints

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas
- Stripe account (test mode)
- Docker (optional)

### Local Development
1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up environment variables:
   ```bash
   cp env.example .env
   # Edit .env with your MongoDB Atlas and Stripe credentials
   ```
3. Build shared utilities:
   ```bash
   cd ../../shared-utils
   npm install
   npm run build
   cd ../../services/payment
   ```
4. Start development server:
   ```bash
   npm run dev
   ```

### Docker
```bash
# Build image
docker build -t payment-service .
# Run container
docker run -p 3005:3005 --env-file .env payment-service
```

## Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3005` |
| `NODE_ENV` | Environment | `development` |
| `MONGODB_URI` | MongoDB Atlas connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `STRIPE_SECRET_KEY` | Stripe secret key | Required |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | Required |

## API Endpoints

### Payments
- `POST /api/payments/intent` — Create payment intent (Stripe or simulation)
- `POST /api/payments/webhook` — Stripe webhook endpoint
- `GET /api/payments/:orderId` — Get payment status for an order

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
payment-service:
  build: ./services/payment
  ports:
    - "3005:3005"
  environment:
    - MONGODB_URI=mongodb://mongo:27017/payment-service
    - JWT_SECRET=your-secret-key
    - STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
    - STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

## Kubernetes
See `k8s-manifests/` for deployment configs. 