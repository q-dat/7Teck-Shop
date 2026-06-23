import { NextRequest, NextResponse } from 'next/server';
import { getAllPhonesFullData } from '@/server/repositories/phone.repository';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;

    const data = await getAllPhonesFullData({
      page: params.get('page') ?? undefined,
      limit: params.get('limit') ?? undefined,
    });

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json({ message: 'Lỗi server', error: message, phones: [] }, { status: 500 });
  }
}
