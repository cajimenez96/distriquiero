import mongoose from 'mongoose';

interface ConnectionCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: ConnectionCache | undefined;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

export async function connectToDatabase(): Promise<typeof mongoose | null> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return null;
  }

  if (cached!.conn) {
    return cached!.conn;
  }

  if (!cached!.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    };

    cached!.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
      console.log('MongoDB successfully connected via Mongoose.');
      return mongooseInstance;
    }).catch((err) => {
      console.warn('MongoDB connection could not be established; continuing with in-memory persistence layer:', err.message);
      cached!.promise = null;
      return null as any;
    });
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    cached!.promise = null;
    return null;
  }

  return cached!.conn;
}

export function isMongoConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
