import { NextResponse } from 'next/server';
import PhoneModel from '@/server/models/phone.model';
import '@/server/models/registerCatalogModels';
import { connectDB } from '@/lib/mongodb';
import { getModelErrorMessage } from '@/server/utils/api/productFilters';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    await connectDB();

    const phone = await PhoneModel.findById(id)
      .populate({ path: 'phone_catalog_id', select: '-createdAt -updatedAt -__v' })
      .lean();

    if (!phone) {
      return NextResponse.json({ message: 'Điện thoại không tồn tại!' }, { status: 404 });
    }

    PhoneModel.updateOne({ _id: phone._id }, { $inc: { view: 1 } }).exec();

    return NextResponse.json({ message: 'Lấy điện thoại theo id thành công!', phone });
  } catch (error) {
    return NextResponse.json({ message: 'Lỗi máy chủ!', error: getModelErrorMessage(error) }, { status: 500 });
  }
}
