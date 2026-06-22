import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is not set. Add it to .env.local');
}

// Cache the connection across hot reloads in dev and across serverless
// invocations in production.
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

const globalForMongoose = global as unknown as { mongoose?: MongooseCache };
const cached: MongooseCache =
  globalForMongoose.mongoose ?? { conn: null, promise: null };

if (!globalForMongoose.mongoose) globalForMongoose.mongoose = cached;

export async function connectDB() {
  if (cached.conn) return cached.conn;
  cached.promise ??= mongoose.connect(MONGODB_URI!, {
    bufferCommands: false,
  });
  cached.conn = await cached.promise;
  return cached.conn;
}