# User Service

Manages user profile data, shipping addresses, and preferences for the e-commerce platform.

## Features
- User profile CRUD
- Shipping address management
- User preferences
- JWT authentication middleware

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
   cd ../../services/user
   ```
4. Start development server:
   ```bash
   npm run dev
   ```

### Docker
```bash
# Build image
docker build -t user-service .
# Run container
docker run -p 3002:3002 --env-file .env user-service
```

## Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3002` |
| `NODE_ENV` | Environment | `development` |
| `MONGODB_URI` | MongoDB Atlas connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |

## API Endpoints

### Protected Endpoints (require JWT)
- `GET /api/user/profile` — Get user profile
- `PUT /api/user/profile` — Update user profile
- `GET /api/user/addresses` — List shipping addresses
- `POST /api/user/addresses` — Add shipping address
- `PUT /api/user/addresses/:id` — Update shipping address
- `DELETE /api/user/addresses/:id` — Delete shipping address
- `GET /api/user/preferences` — Get user preferences
- `PUT /api/user/preferences` — Update user preferences

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

## Development Scripts
- `npm run dev`: Start dev server
- `npm run build`: Build TypeScript
- `npm start`: Start production server
- `npm run clean`: Remove build artifacts

## Docker Compose
```yaml
user-service:
  build: ./services/user
  ports:
    - "3002:3002"
  environment:
    - MONGODB_URI=mongodb://mongo:27017/user-service
    - JWT_SECRET=your-secret-key
```

## Kubernetes
See `k8s-manifests/` for deployment configs. 