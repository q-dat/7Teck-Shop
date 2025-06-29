import mongoose, { Connection } from 'mongoose';

const MONGO_URI = process.env.MONGODB_URI as string;

if (!MONGO_URI) {
  throw new Error('⚠️ MONGODB_URI is missing in environment variables!');
}

interface MongooseCache {
  conn: Connection | null;
  promise: Promise<Connection> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? { conn: null, promise: null };

export async function connectDB(): Promise<Connection> {
  if (cached.conn) {
    console.log('✅ MongoDB đã được kết nối.');
    return cached.conn;
  }

  if (!cached.promise) {
    console.log('Đang kết nối đến MongoDB...');
    cached.promise = mongoose
      .connect(MONGO_URI, {
        dbName: '',
        bufferCommands: false,
      })
      .then((mongooseInstance) => {
        console.log('✅ Kết nối MongoDB thành công!');
        return mongooseInstance.connection;
      })
      .catch((err) => {
        console.error('❌ Lỗi kết nối MongoDB:', err);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  global.mongooseCache = cached;

  return cached.conn;
}