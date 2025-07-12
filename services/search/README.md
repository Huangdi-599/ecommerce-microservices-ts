# Search Service

A microservice for advanced search functionality using Elasticsearch in the e-commerce platform.

## Features

- ✅ Full-text search with fuzzy matching
- ✅ Product search with advanced filtering
- ✅ Category search
- ✅ Search suggestions and autocomplete
- ✅ Faceted search with aggregations
- ✅ Search result highlighting
- ✅ Document indexing and management
- ✅ Bulk indexing operations
- ✅ Real-time search updates
- ✅ Elasticsearch integration
- ✅ Search analytics and statistics
- ✅ Rate limiting and security
- ✅ JWT authentication
- ✅ Role-based access control

## API Endpoints

### Public Search Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/search/products` | Search products with filters |
| GET | `/api/search/categories` | Search categories |
| GET | `/api/search/suggestions` | Get search suggestions |
| GET | `/api/search/health` | Health check |

### Protected Indexing Endpoints (Authentication Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/search/index` | Index a document |
| POST | `/api/search/bulk-index` | Bulk index documents |
| PUT | `/api/search/index/:type/:id` | Update document in index |
| DELETE | `/api/search/index/:type/:id` | Remove document from index |

### Admin Endpoints (Admin Role Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/search/status` | Get indexing status |
| POST | `/api/search/reindex/:service/:type` | Reindex service documents |
| GET | `/api/search/stats` | Get search statistics |

## Request/Response Examples

### Search Products

```bash
GET /api/search/products?q=laptop&category=electronics&priceMin=500&priceMax=2000&rating=4&inStock=true&page=1&limit=20&sortBy=price&sortOrder=asc
```

**Response:**
```json
{
  "results": [
    {
      "id": "507f1f77bcf86cd799439011",
      "type": "product",
      "score": 0.95,
      "data": {
        "id": "507f1f77bcf86cd799439011",
        "name": "MacBook Pro 13-inch",
        "description": "Powerful laptop for professionals",
        "category": "electronics",
        "brand": "Apple",
        "price": 1299.99,
        "rating": 4.5,
        "inStock": true
      },
      "highlights": {
        "name": ["<em>MacBook</em> Pro 13-inch"],
        "description": ["Powerful <em>laptop</em> for professionals"]
      }
    }
  ],
  "total": 150,
  "page": 1,
  "totalPages": 8,
  "aggregations": {
    "categories": [...],
    "brands": [...],
    "price_ranges": [...]
  }
}
```

### Get Search Suggestions

```bash
GET /api/search/suggestions?q=mac&type=product
```

**Response:**
```json
{
  "suggestions": [
    "MacBook Pro",
    "MacBook Air",
    "Mac mini",
    "iMac"
  ]
}
```

### Index Document

```bash
POST /api/search/index
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "documentId": "507f1f77bcf86cd799439011",
  "documentType": "product",
  "service": "product-service"
}
```

**Response:**
```json
{
  "message": "Document indexed successfully",
  "documentId": "507f1f77bcf86cd799439011",
  "documentType": "product",
  "service": "product-service"
}
```

## Environment Variables

```env
# Server Configuration
PORT=3007
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/search-service?retryWrites=true&w=majority

# Elasticsearch Configuration
ELASTICSEARCH_NODE=http://localhost:9200
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=changeme
ELASTICSEARCH_INDEX_PREFIX=ecommerce

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h

# Service URLs
AUTH_SERVICE_URL=http://localhost:3001
PRODUCT_SERVICE_URL=http://localhost:3003
REVIEW_SERVICE_URL=http://localhost:3006

# Search Configuration
SEARCH_MAX_RESULTS=100
SEARCH_FUZZY_THRESHOLD=0.3
SEARCH_HIGHLIGHT_ENABLED=true
SEARCH_SUGGESTIONS_ENABLED=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=200

# Logging
LOG_LEVEL=info
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd services/search
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

4. **Start Elasticsearch**
   ```bash
   # Using Docker
   docker run -d --name elasticsearch -p 9200:9200 -p 9300:9300 \
     -e "discovery.type=single-node" \
     -e "xpack.security.enabled=false" \
     elasticsearch:8.10.0
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Build for production**
   ```bash
   npm run build
   npm start
   ```

## Docker

### Build Image
```bash
docker build -t search-service .
```

### Run Container
```bash
docker run -p 3007:3007 --env-file .env search-service
```

### Docker Compose
```yaml
search-service:
  build: .
  ports:
    - "3007:3007"
  environment:
    - MONGODB_URI=mongodb://mongo:27017/search-service
    - ELASTICSEARCH_NODE=http://elasticsearch:9200
    - JWT_SECRET=your-secret
  depends_on:
    - mongo
    - elasticsearch

elasticsearch:
  image: elasticsearch:8.10.0
  environment:
    - discovery.type=single-node
    - xpack.security.enabled=false
  ports:
    - "9200:9200"
```

## Database Schema

### SearchIndex Collection

```javascript
{
  _id: ObjectId,
  documentId: String,        // Document ID from source service
  documentType: String,      // 'product', 'category', 'review'
  service: String,           // Source service name
  indexedAt: Date,          // When document was indexed
  lastUpdated: Date,        // Last update timestamp
  status: String,           // 'indexed', 'pending', 'failed'
  error: String,            // Error message if failed
  createdAt: Date,
  updatedAt: Date
}
```

## Elasticsearch Indices

### Products Index (`ecommerce_products`)
```json
{
  "mappings": {
    "properties": {
      "id": { "type": "keyword" },
      "name": { 
        "type": "text",
        "analyzer": "product_analyzer",
        "fields": {
          "keyword": { "type": "keyword" }
        }
      },
      "description": { "type": "text" },
      "category": { "type": "keyword" },
      "brand": { "type": "keyword" },
      "price": { "type": "float" },
      "rating": { "type": "float" },
      "inStock": { "type": "boolean" },
      "tags": { "type": "keyword" }
    }
  }
}
```

### Categories Index (`ecommerce_categories`)
```json
{
  "mappings": {
    "properties": {
      "id": { "type": "keyword" },
      "name": { "type": "text" },
      "description": { "type": "text" },
      "parentId": { "type": "keyword" },
      "isActive": { "type": "boolean" }
    }
  }
}
```

## Search Features

### Fuzzy Search
- Automatic typo correction
- Phonetic matching
- Configurable fuzziness levels

### Filtering
- Category filtering
- Price range filtering
- Rating filtering
- Stock availability
- Brand filtering
- Tag filtering

### Sorting
- Relevance score
- Price (asc/desc)
- Rating (asc/desc)
- Date created (asc/desc)

### Highlighting
- Matched terms highlighted in results
- Configurable highlight fields
- HTML-safe highlighting

### Suggestions
- Real-time search suggestions
- Popular search terms
- Category-based suggestions

## Rate Limiting

- **Search Requests**: 200 requests per 15 minutes per IP
- **Indexing Requests**: 10 requests per 15 minutes per IP
- **Admin Requests**: 50 requests per 15 minutes per IP

## Security Features

- ✅ JWT Authentication
- ✅ Role-based Access Control
- ✅ Input Validation
- ✅ Rate Limiting
- ✅ CORS Protection
- ✅ Helmet Security Headers
- ✅ Elasticsearch Security
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
  "service": "Search Service",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "elasticsearch": {
    "health": true,
    "indices": 3
  }
}
```

### Metrics
- Search query performance
- Indexing success rates
- Elasticsearch cluster health
- Response times
- Error rates

## Dependencies

### Production
- `express`: Web framework
- `mongoose`: MongoDB ODM
- `@elastic/elasticsearch`: Elasticsearch client
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