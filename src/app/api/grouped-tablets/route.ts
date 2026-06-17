import { NextRequest, NextResponse } from 'next/server';
import TabletModel from '@/server/models/tablet.model';
import '@/server/models/registerCatalogModels';
import { connectDB } from '@/lib/mongodb';
import { filterByCatalogStatus, getModelErrorMessage, groupByCatalog } from '@/server/utils/api/productFilters';

export const dynamic = 'force-dynamic';

function buildGroupedTabletFilter(searchParams: URLSearchParams) {
  const catalogID = searchParams.get('catalogID');
  const name = searchParams.get('name');

  return {
    ...(catalogID ? { tablet_catalog_id: catalogID } : {}),
    ...(name ? { name: { $regex: name, $options: 'i' } } : {}),
  };
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') ?? searchParams.get('t_cat_status');
    const filterQuery = buildGroupedTabletFilter(searchParams);

    const tablets = await TabletModel.find(filterQuery)
      .populate({ path: 'tablet_catalog_id', select: '-createdAt -updatedAt -__v' })
      .lean();

    const filteredItems = filterByCatalogStatus(tablets, status, ['tablet_catalog_id', 't_cat_status']);
    const count = await TabletModel.countDocuments();

    return NextResponse.json({
      message: 'Lấy danh sách máy tính bảng thành công!',
      count,
      visibleCount: filteredItems.length,
      groupedTablets: groupByCatalog(filteredItems, ['tablet_catalog_id']),
    });
  } catch (error) {
    return NextResponse.json(
      { message: 'Lỗi máy chủ!', error: getModelErrorMessage(error), groupedTablets: [] },
      { status: 500 },
    );
  }
}
