import { NextRequest, NextResponse } from 'next/server';
import MacbookModel from '@/server/models/macbook.model';
import '@/server/models/registerCatalogModels';
import { connectDB } from '@/lib/mongodb';
import { filterByCatalogStatus, getModelErrorMessage, groupByCatalog } from '@/server/utils/api/productFilters';

export const dynamic = 'force-dynamic';

function buildGroupedMacbookFilter(searchParams: URLSearchParams) {
  const catalogID = searchParams.get('catalogID');
  const name = searchParams.get('name');

  return {
    ...(catalogID ? { macbook_catalog_id: catalogID } : {}),
    ...(name ? { name: { $regex: name, $options: 'i' } } : {}),
  };
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') ?? searchParams.get('m_cat_status');
    const filterQuery = buildGroupedMacbookFilter(searchParams);

    const macbook = await MacbookModel.find(filterQuery)
      .populate({ path: 'macbook_catalog_id', select: '-createdAt -updatedAt -__v' })
      .lean();

    const filteredItems = filterByCatalogStatus(macbook, status, ['macbook_catalog_id', 'm_cat_status']);
    const count = await MacbookModel.countDocuments();

    return NextResponse.json({
      message: 'Lấy danh sách Macbook thành công!',
      count,
      visibleCount: filteredItems.length,
      groupedMacbook: groupByCatalog(filteredItems, ['macbook_catalog_id']),
    });
  } catch (error) {
    return NextResponse.json(
      { message: 'Lỗi máy chủ!', error: getModelErrorMessage(error), groupedMacbook: [] },
      { status: 500 },
    );
  }
}
