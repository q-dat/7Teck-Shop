import { NextRequest, NextResponse } from 'next/server';
import { getPhonesData, PhoneSort } from '@/server/repositories/phone.repository';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;

    const data = await getPhonesData({
      catalogID: params.get('catalogID') ?? undefined,
      name: params.get('name') ?? undefined,
      status: params.get('status') ?? undefined,
      hasProduct: params.get('hasProduct') ?? undefined,
      price: params.get('price') ?? undefined,
      minPrice: params.get('minPrice') ?? undefined,
      maxPrice: params.get('maxPrice') ?? undefined,
      color: params.get('color') ?? undefined,
      ram: params.get('ram') ?? undefined,
      storage: params.get('storage') ?? undefined,
      sort: (params.get('sort') as PhoneSort | null) ?? undefined,
      page: params.get('page') ?? undefined,
      limit: params.get('limit') ?? undefined,
    });

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json({ message: 'Lỗi máy chủ!', error: message, phones: [] }, { status: 500 });
  }
}
