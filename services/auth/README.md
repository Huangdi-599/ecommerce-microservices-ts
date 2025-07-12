# Auth Service

Authentication microservice for the e-commerce platform. Handles user registration, login, JWT token management, and user profile operations.

## Features

- User registration and login
- JWT token generation and refresh
- Password hashing with bcrypt
- Role-based access control
- User profile management
- Account activation/deactivation

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Docker (optional)

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env
   # Edit .env with your MongoDB Atlas connection string and JWT secret
   ```

3. **Build shared utilities:**
   ```bash
   cd ../../shared-utils
   npm install
   npm run build
   cd ../../services/auth
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

### Docker

```bash
# Build image
docker build -t auth-service .

# Run container
docker run -p 3001:3001 --env-file .env auth-service
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment | `development` |
| `MONGODB_URI` | MongoDB Atlas connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | Access token expiration | `24h` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiration | `7d` |

## API Endpoints

### Public Endpoints

#### POST `/api/auth/signup`
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "isActive": true
    },
    "token": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  },
  "message": "User registered successfully"
}
```

#### POST `/api/auth/login`
Authenticate user and get tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "isActive": true
    },
    "token": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  },
  "message": "Login successful"
}
```

#### POST `/api/auth/refresh`
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "new_jwt_access_token",
    "refreshToken": "new_jwt_refresh_token"
  },
  "message": "Token refreshed successfully"
}
```

### Protected Endpoints

Require `Authorization: Bearer <token>` header.

#### GET `/api/auth/profile`
Get current user profile.

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "isActive": true
    }
  }
}
```

#### PUT `/api/auth/profile`
Update user profile.

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "firstName": "Jane",
      "lastName": "Smith",
      "role": "user",
      "isActive": true
    }
  },
  "message": "Profile updated successfully"
}
```

## Health Check

#### GET `/health`
Check service health status.

**Response:**
```json
{
  "success": true,
  "message": "Auth Service is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "auth-service",
  "version": "1.0.0"
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "details": [] // Optional validation details
}
```

## User Roles

- `user`: Regular customer
- `admin`: Administrator with full access
- `moderator`: Moderator with limited admin access

## Security Features

- Password hashing with bcrypt (salt rounds: 10)
- JWT tokens with configurable expiration
- CORS enabled
- Helmet security headers
- Input validation with Zod
- Rate limiting (via API Gateway)

## Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  email: String (unique, lowercase),
  password: String (hashed),
  firstName: String,
  lastName: String,
  role: String (enum: user, admin, moderator),
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## Development

### Scripts

- `npm run dev`: Start development server with hot reload
- `npm run build`: Build TypeScript to JavaScript
- `npm start`: Start production server
- `npm run clean`: Remove build artifacts

### Testing

```bash
# Run tests (when implemented)
npm test

# Run tests with coverage
npm run test:coverage
```

## Deployment

### Docker Compose
```yaml
auth-service:
  build: ./services/auth
  ports:
    - "3001:3001"
  environment:
    - MONGODB_URI=mongodb://mongo:27017/auth-service
    - JWT_SECRET=your-secret-key
```

### Kubernetes
See `k8s-manifests/` directory for Kubernetes deployment configurations.

## Monitoring

- Health check endpoint: `/health`
- Logging with Morgan
- Error tracking (integrate with external service)
- Metrics collection (integrate with Prometheus)

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check MongoDB Atlas connection string
   - Verify network access and IP whitelist

2. **JWT Token Invalid**
   - Ensure JWT_SECRET is set correctly
   - Check token expiration

3. **Build Errors**
   - Ensure shared-utils is built: `cd shared-utils && npm run build`
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install` 