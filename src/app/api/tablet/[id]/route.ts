import { NextResponse } from 'next/server';
import TabletModel from '@/server/models/tablet.model';
import '@/server/models/registerCatalogModels';
import { connectDB } from '@/lib/mongodb';
import { getModelErrorMessage } from '@/server/utils/api/productFilters';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    await connectDB();

    const tablet = await TabletModel.findById(id)
      .sort({ updatedAt: -1 })
      .populate({ path: 'tablet_catalog_id', select: '-createdAt -updatedAt -__v' })
      .lean();

    if (!tablet) {
      return NextResponse.json({ message: 'Máy tính bảng không tồn tại!' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Lấy máy tính bảng theo id thành công!', tablet });
  } catch (error) {
    return NextResponse.json({ message: 'Lỗi máy chủ!', error: getModelErrorMessage(error) }, { status: 500 });
  }
}
