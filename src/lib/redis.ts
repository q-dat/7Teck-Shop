import Redis from 'ioredis';

// Tạo instance Redis với cấu hình hợp lý
const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD,
  enableOfflineQueue: true, // Cho phép Redis lưu queue khi mất kết nối
  reconnectOnError: (err) => {
    console.error('⚠️ Lỗi Redis:', err.message);
    return true; // Tự động reconnect nếu gặp lỗi
  },
  retryStrategy: (times) => Math.min(times * 100, 3000), // Tăng dần thời gian chờ khi retry
  maxRetriesPerRequest: null, // Tránh lỗi khi Redis bị pending
  lazyConnect: true, // Chỉ kết nối khi cần, tránh lỗi khi app khởi động
});

let isRedisConnected = false;

// Hàm kết nối Redis an toàn
export const connectRedis = async () => {
  if (isRedisConnected) return redis;

  return new Promise((resolve, reject) => {
    redis.once('connect', () => {
      isRedisConnected = true;
      console.log('✅ Kết nối Redis thành công!');
      resolve(redis);
    });

    redis.once('error', (err) => {
      console.error('❌ Lỗi kết nối Redis:', err);
      reject(err);
    });

    redis.connect().catch((err) => {
      console.error('❌ Không thể kết nối Redis:', err);
      reject(err);
    });
  });
};

export default redis;