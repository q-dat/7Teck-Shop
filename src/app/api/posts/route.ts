import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    message: 'Posts API chưa có model/controller được chuyển sang Next TS',
    posts: [],
  });
}
