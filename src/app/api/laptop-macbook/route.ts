import { NextRequest, NextResponse } from 'next/server';
import MacbookModel from '@/server/models/macbook.model';
import '@/server/models/registerCatalogModels';
import { connectDB } from '@/lib/mongodb';
import { filterByCatalogStatus, getModelErrorMessage } from '@/server/utils/api/productFilters';

export const dynamic = 'force-dynamic';

function buildMacbookFilter(searchParams: URLSearchParams) {
  const catalogID = searchParams.get('catalogID');
  const name = searchParams.get('name');

  return {
    ...(catalogID ? { macbook_catalog_id: catalogID } : {}),
    ...(name ? { macbook_name: { $regex: name, $options: 'i' } } : {}),
  };
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const mCatStatus = searchParams.get('m_cat_status') ?? searchParams.get('status');
    const filterQuery = buildMacbookFilter(searchParams);

    const macbook = await MacbookModel.find(filterQuery)
      .sort({ updatedAt: -1 })
      .populate({ path: 'macbook_catalog_id', select: '-createdAt -updatedAt -__v' })
      .lean();

    const filteredItems = filterByCatalogStatus(macbook, mCatStatus, ['macbook_catalog_id', 'm_cat_status']);
    const count = await MacbookModel.countDocuments(filterQuery);

    return NextResponse.json({
      message: 'Lấy danh sách macbook thành công!',
      count,
      visibleCount: filteredItems.length,
      macbook: filteredItems,
    });
  } catch (error) {
    return NextResponse.json({ message: 'Lỗi máy chủ!', error: getModelErrorMessage(error), macbook: [] }, { status: 500 });
  }
}
