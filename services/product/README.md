# Product Service

Manages products and categories for the e-commerce platform, including image uploads to Cloudinary.

## Features
- CRUD for products and categories
- Product image upload to Cloudinary
- JWT authentication and role-based access (admin for management)

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas
- Cloudinary account (free tier)
- Docker (optional)

### Local Development
1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up environment variables:
   ```bash
   cp env.example .env
   # Edit .env with your MongoDB Atlas and Cloudinary credentials
   ```
3. Build shared utilities:
   ```bash
   cd ../../shared-utils
   npm install
   npm run build
   cd ../../services/product
   ```
4. Start development server:
   ```bash
   npm run dev
   ```

### Docker
```bash
# Build image
docker build -t product-service .
# Run container
docker run -p 3003:3003 --env-file .env product-service
```

## Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3003` |
| `NODE_ENV` | Environment | `development` |
| `MONGODB_URI` | MongoDB Atlas connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Required |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Required |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Required |

## API Endpoints

### Products
- `GET /api/products` — List products
- `POST /api/products` — Create product (admin)
- `GET /api/products/:id` — Get product by ID
- `PUT /api/products/:id` — Update product (admin)
- `DELETE /api/products/:id` — Delete product (admin)
- `POST /api/products/:id/images` — Upload product image (admin)

### Categories
- `GET /api/categories` — List categories
- `POST /api/categories` — Create category (admin)
- `PUT /api/categories/:id` — Update category (admin)
- `DELETE /api/categories/:id` — Delete category (admin)

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
product-service:
  build: ./services/product
  ports:
    - "3003:3003"
  environment:
    - MONGODB_URI=mongodb://mongo:27017/product-service
    - JWT_SECRET=your-secret-key
    - CLOUDINARY_CLOUD_NAME=your-cloud-name
    - CLOUDINARY_API_KEY=your-api-key
    - CLOUDINARY_API_SECRET=your-api-secret
```

## Kubernetes
See `k8s-manifests/` for deployment configs. 