import { refreshRedisCache } from '@/lib/refreshRedis';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await refreshRedisCache();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Lỗi:', err);
    return NextResponse.json({ error: 'Failed to refresh redis' }, { status: 500 });
  }
}
