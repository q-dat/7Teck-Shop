import { NextRequest, NextResponse } from 'next/server';
import { getPriceListByIdData } from '@/server/repositories/priceList.repository';

export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

// API riêng của 7Teck-Shop: lấy bảng giá theo id từ MongoDB cục bộ của shop.
export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ message: 'ID không hợp lệ!' }, { status: 400 });
    }

    const priceList = await getPriceListByIdData(id);

    if (!priceList) {
      return NextResponse.json({ message: 'Bảng giá không tồn tại!' }, { status: 404 });
    }

    return NextResponse.json({ priceList });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json({ message: 'Lỗi máy chủ!', error: message }, { status: 500 });
  }
}
