import { NextRequest, NextResponse } from 'next/server';
import { getGalleryByIdData } from '@/server/repositories/gallery.repository';

export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

// API riêng của 7Teck-Shop: lấy gallery theo id từ MongoDB cục bộ của shop.
export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ message: 'ID không hợp lệ!' }, { status: 400 });
    }

    const gallery = await getGalleryByIdData(id);

    if (!gallery) {
      return NextResponse.json({ message: 'Gallery không tồn tại!' }, { status: 404 });
    }

    return NextResponse.json({ gallery });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json({ message: 'Lỗi máy chủ!', error: message }, { status: 500 });
  }
}
