import mongoose from 'mongoose';

export const connectDatabase = async (uri: string): Promise<void> => {
  try {
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB Atlas');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB Atlas');
  } catch (error) {
    console.error('❌ MongoDB disconnection error:', error);
  }
};

// Graceful shutdown
export const gracefulShutdown = async (): Promise<void> => {
  console.log('🔄 Shutting down gracefully...');
  await disconnectDatabase();
  process.exit(0);
};

// Handle process termination
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown); 