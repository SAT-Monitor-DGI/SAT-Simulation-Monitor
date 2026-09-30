import mongoose from 'mongoose';

const globalForMongo = globalThis;

export async function connectDB() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not configured');
  }

  if (!globalForMongo.mongoConnection) {
    globalForMongo.mongoConnection = mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10,
      minPoolSize: 0,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
    });
  }

  try {
    await globalForMongo.mongoConnection;
    return mongoose.connection;
  } catch (error) {
    globalForMongo.mongoConnection = undefined;
    throw error;
  }
}
