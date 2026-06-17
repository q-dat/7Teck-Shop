import { NextResponse } from 'next/server';
import WindowsModel from '@/server/models/windows.model';
import '@/server/models/registerCatalogModels';
import { connectDB } from '@/lib/mongodb';
import { getModelErrorMessage } from '@/server/utils/api/productFilters';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    await connectDB();

    const windows = await WindowsModel.findById(id)
      .populate({ path: 'windows_catalog_id', select: '-createdAt -updatedAt -__v' })
      .lean();

    if (!windows) {
      return NextResponse.json({ message: 'Sản phẩm Windows không tồn tại!' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Lấy sản phẩm Windows theo id thành công!', windows });
  } catch (error) {
    return NextResponse.json({ message: 'Lỗi máy chủ!', error: getModelErrorMessage(error) }, { status: 500 });
  }
}
