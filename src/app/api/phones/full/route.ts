import { NextRequest, NextResponse } from 'next/server';
import PhoneModel from '@/server/models/phone.model';
import '@/server/models/registerCatalogModels';
import { connectDB } from '@/lib/mongodb';
import { getModelErrorMessage } from '@/server/utils/api/productFilters';
import { buildPaginationMeta, getPaginationParams } from '@/server/utils/api/pagination';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { page, limit, skip } = getPaginationParams(request.nextUrl.searchParams, {
      defaultPage: 1,
      defaultLimit: 50,
      maxLimit: 200,
    });

    const [phones, totalItems] = await Promise.all([
      PhoneModel.find({})
        .populate({
          path: 'phone_catalog_id',
          select: '-__v -createdAt -updatedAt',
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      PhoneModel.countDocuments({}),
    ]);

    return NextResponse.json({
      message: 'Lấy toàn bộ phones thành công',
      count: totalItems,
      pageCount: phones.length,
      pagination: buildPaginationMeta({ page, limit, totalItems }),
      phones,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Lỗi server',
        error: getModelErrorMessage(error),
        phones: [],
      },
      { status: 500 },
    );
  }
}
