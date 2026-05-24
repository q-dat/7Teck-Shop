import { NextRequest, NextResponse } from 'next/server';
import PhoneModel from '@/server/models/phone.model';
import PhoneCatalogModel from '@/server/models/phoneCatalog.model';
import { connectDB } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type BackendPhonesResponse = {
  phones: unknown[];
};

async function fetchBackendPhones(request: NextRequest): Promise<BackendPhonesResponse> {
  if (!API_BASE_URL) {
    throw new Error('Missing API base URL');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  try {
    const response = await fetch(`${API_BASE_URL}/api/phones${request.nextUrl.search}`, {
      signal: controller.signal,
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Backend failed with status ${response.status}`);
    }

    return (await response.json()) as BackendPhonesResponse;
  } finally {
    clearTimeout(timeoutId);
  }
}

function buildPhoneQuery(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const catalogID = searchParams.get('catalogID');
  const status = searchParams.get('status');

  return {
    ...(catalogID ? { phone_catalog_id: catalogID } : {}),
    ...(status !== null ? { status } : {}),
  };
}

async function getPhonesFromNextDB(request: NextRequest) {
  await connectDB();

  // Đảm bảo model catalog đã được register trước khi populate.
  PhoneCatalogModel;

  const phones = await PhoneModel.find(buildPhoneQuery(request))
    .populate('phone_catalog_id')
    .sort({
      createdAt: -1,
    })
    .lean();

  return {
    phones,
    source: 'next-db-fallback',
  };
}

export async function GET(request: NextRequest) {
  try {
    const data = await fetchBackendPhones(request);
    return NextResponse.json(data);
  } catch {
    const data = await getPhonesFromNextDB(request);
    return NextResponse.json(data);
  }
}
