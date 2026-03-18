/**
 * Tách product ID từ slug dạng SEO: "ten-san-pham-<id>"
 *
 * Ví dụ:
 * - "iphone-15-pro-max-abc123" → "abc123"
 * - "macbook-air-m1-xyz789" → "xyz789"
 *
 * Mục đích:
 * - Dùng khi URL chỉ có 1 param (slug-id)
 * - Lấy ID thật để query database
 * - Phục vụ routing kiểu SEO (gộp slug + id)
 *
 * Lưu ý:
 * - Nếu slug không chứa dấu "-" hoặc không có ID → trả về null
 * - Không validate format ID (có thể bổ sung nếu cần)
 */
export function extractIdFromSlug(slug: string): string | null {
  const parts = slug.split('-');

  // Nếu không có dấu "-" → không phải dạng slug-id
  if (parts.length <= 1) return null;

  // ID luôn nằm ở cuối slug
  return parts[parts.length - 1];
}
