import { NextResponse } from 'next/server';
import { getMostViewedPhonesData } from '@/server/repositories/phone.repository';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getMostViewedPhonesData();
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json({ message: 'Lỗi máy chủ!', error: message, phones: [] }, { status: 500 });
  }
}
