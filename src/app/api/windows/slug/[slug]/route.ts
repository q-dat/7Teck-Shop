import { NextResponse } from 'next/server';
import { getWindowsBySlugData } from '@/server/repositories/windows.repository';

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

    const data = await getWindowsBySlugData(slug);

    if (!data) {
      return NextResponse.json({ message: 'Sản phẩm Windows không tồn tại!' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json({ message: 'Lỗi máy chủ!', error: message }, { status: 500 });
  }
}
