import { NextResponse } from 'next/server';
import PhoneModel from '@/server/models/phone.model';
import '@/server/models/registerCatalogModels';
import { connectDB } from '@/lib/mongodb';
import { getModelErrorMessage } from '@/server/utils/api/productFilters';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();

    const topPhones = await PhoneModel.find({})
      .sort({ view: -1 })
      .limit(10)
      .populate({
        path: 'phone_catalog_id',
        select: '-createdAt -updatedAt -__v',
      })
      .lean();

    return NextResponse.json({
      message: 'Lấy danh sách top 20 điện thoại thành công!',
      phones: topPhones,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Lỗi máy chủ!',
        error: getModelErrorMessage(error),
        phones: [],
      },
      { status: 500 },
    );
  }
}
