import { NextResponse } from 'next/server';
import { getWindowsByIdData } from '@/server/repositories/windows.repository';

export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const data = await getWindowsByIdData(id);

    if (!data) {
      return NextResponse.json({ message: 'Sản phẩm Windows không tồn tại!' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json({ message: 'Lỗi máy chủ!', error: message }, { status: 500 });
  }
}
