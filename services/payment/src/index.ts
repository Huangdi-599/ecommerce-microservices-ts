import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDatabase, errorHandler, notFound } from 'shared-utils';
import paymentRoutes from './routes/paymentRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));

// Raw body for webhook signature verification
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// JSON parsing for other routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Payment Service is running',
    timestamp: new Date().toISOString(),
    service: 'payment-service',
    version: process.env.SERVICE_VERSION || '1.0.0',
  });
});

app.use('/api/payments', paymentRoutes);

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDatabase(process.env.MONGODB_URI!);
    app.listen(PORT, () => {
      console.log(`🚀 Payment Service running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`💳 Payment endpoints: http://localhost:${PORT}/api/payments`);
    });
  } catch (error) {
    console.error('❌ Failed to start Payment Service:', error);
    process.exit(1);
  }
};

startServer(); 