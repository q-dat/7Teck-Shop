import '@/server/models/registerModels';
import { connectDB } from '@/lib/mongodb';
import PriceListModel from '@/server/models/priceList.model';
import { IPriceListApi } from '@/types/type/price-list/price-list';

export async function getPriceListsData(): Promise<IPriceListApi[]> {
  await connectDB();

  const priceLists = await PriceListModel.find({})
    .sort({ createdAt: -1 })
    .lean();

  return priceLists as unknown as IPriceListApi[];
}

export async function getPriceListByIdData(id: string): Promise<IPriceListApi | null> {
  await connectDB();

  const priceList = await PriceListModel.findById(id).lean();

  if (!priceList) return null;

  return priceList as unknown as IPriceListApi;
}
