/**
 * Lấy API URL từ biến môi trường, không dùng headers() để tối ưu SSR
 * @param endpoint Đường dẫn API (VD: `/api/wallet`)
 * @returns URL đầy đủ (VD: `http://localhost:3000/api/wallet`)
 */
export function getServerApiUrl(endpoint: string) {
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    return `${apiUrl}${endpoint}`;
  }
  