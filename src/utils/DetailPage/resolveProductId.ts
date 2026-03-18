import { decodeObjectId } from './objectIdCodec';

// Regex kiểm tra ObjectId MongoDB (24 ký tự hex)
const OBJECT_ID_REGEX = /^[a-f0-9]{24}$/i;

/**
 * Resolve product ID từ URL về ObjectId chuẩn để query database
 *
 * Mục đích:
 * - Chuẩn hóa ID đầu vào (raw) về dạng ObjectId hợp lệ
 * - Hỗ trợ nhiều format ID trong URL:
 *    1. ObjectId gốc (24 ký tự hex)
 *    2. ID đã encode base62 (dùng cho URL ngắn gọn)
 *
 * Flow xử lý:
 * - Nếu raw là ObjectId hợp lệ → dùng trực tiếp
 * - Nếu không → thử decode base62 → lấy ObjectId
 * - Nếu cả 2 đều fail → trả về null
 *
 * Ví dụ:
 * - "65f1c2a9e8d123456789abcd" → "65f1c2a9e8d123456789abcd"
 * - "abcXYZ123" → "65f1c2a9e8d123456789abcd"
 * - "invalid" → null
 *
 * Trả về:
 * - string: ObjectId hợp lệ (đã normalize lowercase)
 * - null: không resolve được ID
 *
 * Lưu ý:
 * - Đây là bước trung gian giữa URL và database
 * - Không dùng cho business logic, chỉ dùng cho routing / data fetching
 */
export function resolveProductId(raw: string): string | null {
  // 1. Nếu là ObjectId nguyên bản → dùng luôn
  if (OBJECT_ID_REGEX.test(raw)) {
    return raw.toLowerCase(); // normalize về lowercase
  }

  // 2. Thử decode từ base62 (URL encoded)
  const decoded = decodeObjectId(raw);
  if (decoded) return decoded;

  // 3. Không hợp lệ
  return null;
}
