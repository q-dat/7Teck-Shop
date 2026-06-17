import { NextRequest, NextResponse } from 'next/server';
import PhoneModel from '@/server/models/phone.model';
import '@/server/models/registerCatalogModels';
import { connectDB } from '@/lib/mongodb';
import { filterPhoneItems, getModelErrorMessage, groupByCatalog } from '@/server/utils/api/productFilters';

export const dynamic = 'force-dynamic';

function buildPhoneFilter(searchParams: URLSearchParams) {
  const catalogID = searchParams.get('catalogID');
  const name = searchParams.get('name');

  return {
    ...(catalogID ? { phone_catalog_id: catalogID } : {}),
    ...(name ? { name: { $regex: name, $options: 'i' } } : {}),
  };
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const filterQuery = buildPhoneFilter(searchParams);

    const phones = await PhoneModel.find(filterQuery)
      .select('-thumbnail -__v -createdAt -updatedAt')
      .populate({
        path: 'phone_catalog_id',
        select: 'name img price status content configuration_and_memory phone_catalog_id',
      })
      .lean();

    const filteredItems = filterPhoneItems(phones, searchParams);
    const count = await PhoneModel.countDocuments();

    return NextResponse.json({
      message: 'Lấy danh sách điện thoại thành công!',
      count,
      visibleCount: filteredItems.length,
      groupedPhones: groupByCatalog(filteredItems, ['phone_catalog_id']),
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Lỗi máy chủ!',
        error: getModelErrorMessage(error),
        groupedPhones: [],
      },
      { status: 500 },
    );
  }
}
