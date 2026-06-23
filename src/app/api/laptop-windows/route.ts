import { NextRequest, NextResponse } from 'next/server';
import { getWindowsData } from '@/server/repositories/windows.repository';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;

    const data = await getWindowsData({
      catalogID: params.get('catalogID') ?? undefined,
      name: params.get('name') ?? undefined,
      status: params.get('status') ?? undefined,
      w_cat_status: params.get('w_cat_status') ?? undefined,
    });

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json({ message: 'Lỗi máy chủ!', error: message, windows: [] }, { status: 500 });
  }
}
