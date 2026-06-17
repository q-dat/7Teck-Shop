import { NextRequest, NextResponse } from 'next/server';
import WindowsModel from '@/server/models/windows.model';
import '@/server/models/registerCatalogModels';
import { connectDB } from '@/lib/mongodb';
import { filterByCatalogStatus, getModelErrorMessage, groupByCatalog } from '@/server/utils/api/productFilters';

export const dynamic = 'force-dynamic';

function buildGroupedWindowsFilter(searchParams: URLSearchParams) {
  const catalogID = searchParams.get('catalogID');
  const name = searchParams.get('name');

  return {
    ...(catalogID ? { windows_catalog_id: catalogID } : {}),
    ...(name ? { name: { $regex: name, $options: 'i' } } : {}),
  };
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') ?? searchParams.get('w_cat_status');
    const filterQuery = buildGroupedWindowsFilter(searchParams);

    const windows = await WindowsModel.find(filterQuery)
      .populate({ path: 'windows_catalog_id', select: '-createdAt -updatedAt -__v' })
      .lean();

    const filteredItems = filterByCatalogStatus(windows, status, ['windows_catalog_id', 'w_cat_status']);
    const count = await WindowsModel.countDocuments();

    return NextResponse.json({
      message: 'Lấy danh sách Windows thành công!',
      count,
      visibleCount: filteredItems.length,
      groupedWindows: groupByCatalog(filteredItems, ['windows_catalog_id']),
    });
  } catch (error) {
    return NextResponse.json(
      { message: 'Lỗi máy chủ!', error: getModelErrorMessage(error), groupedWindows: [] },
      { status: 500 },
    );
  }
}
