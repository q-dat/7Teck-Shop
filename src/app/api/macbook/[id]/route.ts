import { NextResponse } from 'next/server';
import MacbookModel from '@/server/models/macbook.model';
import '@/server/models/registerCatalogModels';
import { connectDB } from '@/lib/mongodb';
import { getModelErrorMessage } from '@/server/utils/api/productFilters';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    await connectDB();

    const macbook = await MacbookModel.findById(id)
      .populate({ path: 'macbook_catalog_id', select: '-createdAt -updatedAt -__v' })
      .lean();

    if (!macbook) {
      return NextResponse.json({ message: 'Sản phẩm Macbook không tồn tại!' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Lấy sản phẩm Macbook theo id thành công!', macbook });
  } catch (error) {
    return NextResponse.json({ message: 'Lỗi máy chủ!', error: getModelErrorMessage(error) }, { status: 500 });
  }
}
