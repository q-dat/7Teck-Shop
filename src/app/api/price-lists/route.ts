import { NextRequest, NextResponse } from 'next/server';
import { getPriceListsData } from '@/server/repositories/priceList.repository';

export const dynamic = 'force-dynamic';

// API riêng của 7Teck-Shop: lấy danh sách bảng giá từ MongoDB cục bộ của shop
// (cùng cơ chế với /api/phones). BE 7teck chỉ là nguồn seed, không gọi trực tiếp.
export async function GET(_request: NextRequest) {
  try {
    const priceLists = await getPriceListsData();

    return NextResponse.json({ priceLists });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json({ message: 'Lỗi máy chủ!', error: message, priceLists: [] }, { status: 500 });
  }
}
