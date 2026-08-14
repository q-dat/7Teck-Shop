import { NextResponse } from 'next/server';
import { getTabletBySlugData } from '@/server/repositories/tablet.repository';

export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { slug } = await context.params;

    if (!slug) {
      return NextResponse.json({ message: 'Slug không hợp lệ!' }, { status: 400 });
    }

    const data = await getTabletBySlugData(slug);

    if (!data) {
      return NextResponse.json({ message: 'Máy tính bảng không tồn tại!' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json({ message: 'Lỗi máy chủ!', error: message }, { status: 500 });
  }
}
