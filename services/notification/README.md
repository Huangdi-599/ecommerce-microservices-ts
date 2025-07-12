# Notification Service

Handles sending order confirmations and status updates via email for the e-commerce platform.

## Features
- Send order confirmation and status update emails
- Use Mailgun (sandbox) or Nodemailer (Gmail) for email delivery
- JWT authentication for protected endpoints (if needed)

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas
- Mailgun account (sandbox) or Gmail account (with app password)
- Docker (optional)

### Local Development
1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up environment variables:
   ```bash
   cp env.example .env
   # Edit .env with your MongoDB Atlas and email credentials
   ```
3. Build shared utilities:
   ```bash
   cd ../../shared-utils
   npm install
   npm run build
   cd ../../services/notification
   ```
4. Start development server:
   ```bash
   npm run dev
   ```

### Docker
```bash
# Build image
docker build -t notification-service .
# Run container
docker run -p 3006:3006 --env-file .env notification-service
```

## Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3006` |
| `NODE_ENV` | Environment | `development` |
| `MONGODB_URI` | MongoDB Atlas connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `MAILGUN_API_KEY` | Mailgun API key | Optional |
| `MAILGUN_DOMAIN` | Mailgun domain | Optional |
| `MAILGUN_FROM_EMAIL` | Mailgun sender email | Optional |
| `GMAIL_USER` | Gmail address | Optional |
| `GMAIL_PASS` | Gmail app password | Optional |

## API Endpoints

### Notifications
- `POST /api/notifications/order-confirmation` — Send order confirmation email
- `POST /api/notifications/order-status` — Send order status update email

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
notification-service:
  build: ./services/notification
  ports:
    - "3006:3006"
  environment:
    - MONGODB_URI=mongodb://mongo:27017/notification-service
    - JWT_SECRET=your-secret-key
    - MAILGUN_API_KEY=your-mailgun-api-key
    - MAILGUN_DOMAIN=your-mailgun-domain
    - MAILGUN_FROM_EMAIL=your-sender@example.com
    - GMAIL_USER=your-gmail-address@gmail.com
    - GMAIL_PASS=your-gmail-app-password
```

## Kubernetes
See `k8s-manifests/` for deployment configs. 