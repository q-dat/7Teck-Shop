import { NextRequest, NextResponse } from 'next/server';
import WindowsModel from '@/server/models/windows.model';
import '@/server/models/registerCatalogModels';
import { connectDB } from '@/lib/mongodb';
import { filterByCatalogStatus, getModelErrorMessage } from '@/server/utils/api/productFilters';

export const dynamic = 'force-dynamic';

function buildWindowsFilter(searchParams: URLSearchParams) {
  const catalogID = searchParams.get('catalogID');
  const name = searchParams.get('name');

  return {
    ...(catalogID ? { windows_catalog_id: catalogID } : {}),
    ...(name ? { windows_name: { $regex: name, $options: 'i' } } : {}),
  };
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const wCatStatus = searchParams.get('w_cat_status') ?? searchParams.get('status');
    const filterQuery = buildWindowsFilter(searchParams);

    const windows = await WindowsModel.find(filterQuery)
      .sort({ updatedAt: -1 })
      .populate({ path: 'windows_catalog_id', select: '-createdAt -updatedAt -__v' })
      .lean();

    const filteredItems = filterByCatalogStatus(windows, wCatStatus, ['windows_catalog_id', 'w_cat_status']);
    const count = await WindowsModel.countDocuments(filterQuery);

    return NextResponse.json({
      message: 'Lấy danh sách windows thành công!',
      count,
      visibleCount: filteredItems.length,
      windows: filteredItems,
    });
  } catch (error) {
    return NextResponse.json({ message: 'Lỗi máy chủ!', error: getModelErrorMessage(error), windows: [] }, { status: 500 });
  }
}
