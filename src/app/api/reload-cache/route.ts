import { NextResponse } from 'next/server';
import { loadCache } from '@/lib/searchCache';

export async function POST(req: Request) {
  const token = req.headers.get('authorization');
  if (token !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
  }

  try {
    await loadCache();
    return NextResponse.json({ success: true, message: 'Cache reloaded' });
  } catch {
    return NextResponse.json({ success: false, message: 'Reload failed' }, { status: 500 });
  }
}
