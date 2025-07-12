import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDatabase, errorHandler, notFound } from 'shared-utils';
import productRoutes from './routes/productRoutes';
import categoryRoutes from './routes/categoryRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Product Service is running',
    timestamp: new Date().toISOString(),
    service: 'product-service',
    version: process.env.SERVICE_VERSION || '1.0.0',
  });
});

app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDatabase(process.env.MONGODB_URI!);
    app.listen(PORT, () => {
      console.log(`🚀 Product Service running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🛒 Product endpoints: http://localhost:${PORT}/api/products`);
      console.log(`📂 Category endpoints: http://localhost:${PORT}/api/categories`);
    });
  } catch (error) {
    console.error('❌ Failed to start Product Service:', error);
    process.exit(1);
  }
};

startServer(); 