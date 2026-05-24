/**
 * Lấy API URL từ biến môi trường, không dùng headers() để tối ưu SSR
 * @param endpoint Đường dẫn API (VD: `/api/wallet`)
 * @returns URL đầy đủ (VD: `http://localhost:3000/api/phones`)
export function getServerApiUrl(endpoint: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  return `${apiUrl}${endpoint}`;
}
*/

/**
 * Lấy API URL nội bộ của Next.js/Vercel.
 *
 * Mục tiêu:
 * - Service/frontend không gọi thẳng backend Render nữa.
 * - Service sẽ gọi API route của chính Next.js, ví dụ: /api/phones.
 * - Bên trong Next API route mới gọi backend Render thông qua fetchWithBackendFallback.
 * - Nếu Render bị sleep/die/timeout thì Next API route fallback trực tiếp MongoDB.
 *
 * ENV cần có:
 *
 * 1. NEXT_PUBLIC_SITE_URL
 *    - Domain frontend Next.js đang deploy trên Vercel.
 *    - Production ví dụ:
 *      NEXT_PUBLIC_SITE_URL=https://www.7teck.vn
 *
 *    - Local có thể để:
 *      NEXT_PUBLIC_SITE_URL=http://localhost:3000
 *
 * 2. NEXT_PUBLIC_API_BASE_URL
 *    - Domain backend gốc, ví dụ backend Render hoặc API server riêng.
 *    - Biến này KHÔNG nên dùng trực tiếp trong service/frontend nữa.
 *    - Chỉ nên dùng bên trong fetchWithBackendFallback.
 *    - Ví dụ:
 *      NEXT_PUBLIC_API_BASE_URL=https://api.7teck.vn
 *
 * 3. MONGODB_URI
 *    - Chuỗi kết nối MongoDB.
 *    - Dùng cho Next API route fallback query database trực tiếp khi backend Render lỗi.
 *    - Ví dụ:
 *      MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/database_name
 *
 * 4. VERCEL_URL
 *    - Biến này Vercel tự cấp khi deploy.
 *    - Không cần tự tạo trong Vercel.
 */

export function getServerApiUrl(endpoint: string): string {
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  /**
   * Client-side:
   * Gọi relative path để browser tự dùng domain hiện tại.
   *
   * Ví dụ:
   * /api/phones
   *
   * Khi đang ở production:
   * https://www.7teck.vn/api/phones
   */
  if (typeof window !== 'undefined') {
    return normalizedEndpoint;
  }

  /**
   * Server-side SSR / Server Component:
   * Dùng domain frontend Next.js chính thức.
   *
   * Cần tạo trong .env:
   * NEXT_PUBLIC_SITE_URL=https://www.7teck.vn
   */
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (siteUrl) {
    return `${siteUrl.replace(/\/$/, '')}${normalizedEndpoint}`;
  }

  /**
   * Fallback trên Vercel:
   * VERCEL_URL là biến Vercel tự cấp.
   *
   * Ví dụ:
   * VERCEL_URL=your-project.vercel.app
   */
  const vercelUrl = process.env.VERCEL_URL;

  if (vercelUrl) {
    return `https://${vercelUrl.replace(/\/$/, '')}${normalizedEndpoint}`;
  }

  /**
   * Local fallback:
   * Dùng khi chưa có NEXT_PUBLIC_SITE_URL.
   */
  return `http://localhost:${process.env.PORT ?? 3000}${normalizedEndpoint}`;
}
