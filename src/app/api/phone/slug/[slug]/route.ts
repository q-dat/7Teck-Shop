import { NextResponse } from 'next/server';
import PhoneModel from '@/server/models/phone.model';
import '@/server/models/registerCatalogModels';
import { connectDB } from '@/lib/mongodb';
import { getModelErrorMessage } from '@/server/utils/api/productFilters';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { slug } = await context.params;

    if (!slug) {
      return NextResponse.json({ message: 'Slug không hợp lệ!' }, { status: 400 });
    }

    await connectDB();

    const phone = await PhoneModel.findOne({ slug })
      .populate({ path: 'phone_catalog_id', select: '-createdAt -updatedAt -__v' })
      .lean();

    if (!phone) {
      return NextResponse.json({ message: 'Điện thoại không tồn tại!' }, { status: 404 });
    }

    PhoneModel.updateOne({ _id: phone._id }, { $inc: { view: 1 } }).exec();

    return NextResponse.json({ message: 'Lấy điện thoại theo slug thành công!', phone });
  } catch (error) {
    return NextResponse.json({ message: 'Lỗi máy chủ!', error: getModelErrorMessage(error) }, { status: 500 });
  }
}
