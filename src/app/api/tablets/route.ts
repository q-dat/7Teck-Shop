import { NextRequest, NextResponse } from 'next/server';
import TabletModel from '@/server/models/tablet.model';
import '@/server/models/registerCatalogModels';
import { connectDB } from '@/lib/mongodb';
import { filterByCatalogStatus, getModelErrorMessage } from '@/server/utils/api/productFilters';

export const dynamic = 'force-dynamic';

function buildTabletFilter(searchParams: URLSearchParams) {
  const catalogID = searchParams.get('catalogID');
  const name = searchParams.get('name');

  return {
    ...(catalogID ? { tablet_catalog_id: catalogID } : {}),
    ...(name ? { tablet_name: { $regex: name, $options: 'i' } } : {}),
  };
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const tCatStatus = searchParams.get('t_cat_status') ?? searchParams.get('status');
    const filterQuery = buildTabletFilter(searchParams);

    const tablets = await TabletModel.find(filterQuery)
      .sort({ updatedAt: -1 })
      .populate({ path: 'tablet_catalog_id', select: '-createdAt -updatedAt -__v' })
      .lean();

    const filteredItems = filterByCatalogStatus(tablets, tCatStatus, ['tablet_catalog_id', 't_cat_status']);
    const count = await TabletModel.countDocuments(filterQuery);

    return NextResponse.json({
      message: 'Lấy danh sách máy tính bảng thành công!',
      count,
      visibleCount: filteredItems.length,
      tablets: filteredItems,
    });
  } catch (error) {
    return NextResponse.json({ message: 'Lỗi máy chủ!', error: getModelErrorMessage(error), tablets: [] }, { status: 500 });
  }
}
