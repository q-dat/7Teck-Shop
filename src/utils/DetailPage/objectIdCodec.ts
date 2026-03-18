import baseX from 'base-x';

// Bảng ký tự base62 (0-9, a-z, A-Z)
// → dùng để encode dữ liệu nhị phân thành chuỗi ngắn gọn, URL-safe
const BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const base62 = baseX(BASE62);

/**
 * Encode MongoDB ObjectId (24 ký tự hex) → chuỗi base62 ngắn hơn
 *
 * Ví dụ:
 * - "65f1c2a9e8d123456789abcd" → "abcXYZ123"
 *
 * Mục đích:
 * - Rút gọn ID khi đưa lên URL
 * - Tránh lộ trực tiếp ObjectId
 * - Tạo URL thân thiện, dễ chia sẻ
 *
 * Cách hoạt động:
 * - Convert hex → binary (Buffer)
 * - Encode binary → base62
 */
export function encodeObjectId(objectId: string): string {
  return base62.encode(Buffer.from(objectId, 'hex'));
}

/**
 * Decode chuỗi base62 → ObjectId (24 ký tự hex)
 *
 * Ví dụ:
 * - "abcXYZ123" → "65f1c2a9e8d123456789abcd"
 *
 * Mục đích:
 * - Lấy lại ObjectId thật để query database
 * - Dùng trong routing khi nhận URL encoded
 *
 * Cách hoạt động:
 * - Decode base62 → binary
 * - Convert binary → hex string
 * - Validate có đúng format ObjectId không
 *
 * Trả về:
 * - string (ObjectId hợp lệ)
 * - null nếu decode lỗi hoặc không đúng format
 */
export function decodeObjectId(encoded: string): string | null {
  try {
    const hex = Buffer.from(base62.decode(encoded)).toString('hex');

    // Validate ObjectId MongoDB (24 ký tự hex)
    return /^[a-f0-9]{24}$/.test(hex) ? hex : null;
  } catch {
    // Nếu decode fail (input không hợp lệ)
    return null;
  }
}
