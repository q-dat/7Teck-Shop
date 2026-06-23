import '@/server/models/registerCatalogModels';
import { connectDB } from '@/lib/mongodb';
import PhoneModel from '@/server/models/phone.model';
import { buildPaginationMeta, paginateArray } from '@/server/utils/api/pagination';

export type PhoneSort = 'price_asc' | 'price_desc' | 'newest';

export type PhoneQueryInput = {
  catalogID?: string;
  name?: string;
  status?: string;
  hasProduct?: string;
  price?: string;
  minPrice?: string;
  maxPrice?: string;
  color?: string;
  ram?: string;
  storage?: string;
  sort?: PhoneSort;
  page?: string;
  limit?: string;
};

type PhoneCatalogLike = {
  _id?: unknown;
  status?: number;
  configuration_and_memory?: {
    ram?: string;
    storage_capacity?: string;
  };
};

type PhoneLike = {
  _id?: unknown;
  phone_catalog_id?: PhoneCatalogLike | unknown;
  name?: string;
  view?: number;
  color?: string;
  price?: number;
  createdAt?: Date | string;
};

function getPhoneCatalog(item: PhoneLike): PhoneCatalogLike | undefined {
  const catalog = item.phone_catalog_id;

  if (!catalog || typeof catalog !== 'object') {
    return undefined;
  }

  return catalog as PhoneCatalogLike;
}

function buildPhoneBaseQuery(query: PhoneQueryInput): Record<string, unknown> {
  const filterQuery: Record<string, unknown> = {};

  if (query.catalogID) {
    filterQuery.phone_catalog_id = query.catalogID;
  }

  if (query.name) {
    filterQuery.name = { $regex: query.name, $options: 'i' };
  }

  return filterQuery;
}

function filterPhones<T extends PhoneLike>(phones: T[], query: PhoneQueryInput): T[] {
  const shouldFilterStatus = query.status === '0' || query.status === '1';
  const shouldFilterProductCount = query.hasProduct === 'true';
  const shouldFilterSinglePrice = Boolean(query.price);
  const shouldFilterRangePrice = Boolean(query.minPrice || query.maxPrice);
  const shouldFilterColor = Boolean(query.color);
  const shouldFilterRam = Boolean(query.ram);
  const shouldFilterStorage = Boolean(query.storage);

  const statusFilter = shouldFilterStatus ? Number(query.status) : null;
  const maxSingle = query.price ? Number(query.price) : null;
  const min = query.minPrice ? Number(query.minPrice) : null;
  const max = query.maxPrice ? Number(query.maxPrice) : null;

  return phones.filter((item) => {
    const catalog = getPhoneCatalog(item);
    const itemStatus = catalog?.status;
    const count = 1;
    const itemPrice = item.price ?? 0;
    const itemColor = item.color?.toLowerCase();
    const itemRam = catalog?.configuration_and_memory?.ram;
    const itemStorage = catalog?.configuration_and_memory?.storage_capacity;

    const matchesStatus = shouldFilterStatus ? itemStatus === statusFilter : true;
    const matchesProduct = shouldFilterProductCount ? count > 0 : true;
    const matchesSinglePrice = shouldFilterSinglePrice ? itemPrice <= (maxSingle ?? 0) : true;
    const matchesRangePrice = shouldFilterRangePrice ? (!min || itemPrice >= min) && (!max || itemPrice <= max) : true;
    const matchesColor = shouldFilterColor ? itemColor?.includes(query.color!.toLowerCase()) : true;
    const matchesRam = shouldFilterRam ? itemRam === query.ram : true;
    const matchesStorage = shouldFilterStorage ? itemStorage === query.storage : true;

    return matchesStatus && matchesProduct && matchesSinglePrice && matchesRangePrice && Boolean(matchesColor) && matchesRam && matchesStorage;
  });
}

function sortPhones<T extends PhoneLike>(phones: T[], sort?: PhoneSort): T[] {
  return [...phones].sort((a, b) => {
    if (sort === 'price_asc') return (a.price ?? 0) - (b.price ?? 0);
    if (sort === 'price_desc') return (b.price ?? 0) - (a.price ?? 0);

    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;

    return timeB - timeA;
  });
}

export async function getPhonesData(query: PhoneQueryInput) {
  await connectDB();

  const filterQuery = buildPhoneBaseQuery(query);

  const phones = await PhoneModel.find(filterQuery)
    .populate({
      path: 'phone_catalog_id',
      select: 'phone_catalog_id name img price status content configuration_and_memory design_and_material',
    })
    .lean();

  const filteredItems = sortPhones(filterPhones(phones, query), query.sort);

  const paginationParams = new URLSearchParams();

  if (query.page) {
    paginationParams.set('page', query.page);
  }

  if (query.limit) {
    paginationParams.set('limit', query.limit);
  }

  const paginatedResult = paginateArray(filteredItems, paginationParams, {
    defaultPage: 1,
    defaultLimit: 20,
    maxLimit: 100,
  });
  const totalCount = await PhoneModel.countDocuments(filterQuery);

  return {
    message: 'Lấy danh sách điện thoại thành công!',
    count: totalCount,
    visibleCount: filteredItems.length,
    pageCount: paginatedResult.items.length,
    pagination: paginatedResult.pagination,
    phones: paginatedResult.items,
  };
}

export async function getGroupedPhonesData(query: PhoneQueryInput) {
  await connectDB();

  const filterQuery = buildPhoneBaseQuery(query);

  const phones = await PhoneModel.find(filterQuery)
    .select('-thumbnail -__v -createdAt -updatedAt')
    .populate({
      path: 'phone_catalog_id',
      select: 'name img price status content configuration_and_memory phone_catalog_id',
    })
    .lean();

  const filteredItems = sortPhones(filterPhones(phones, query), query.sort);
  const count = await PhoneModel.countDocuments();

  const groupedMap = new Map<string, { catalog: unknown; variants: typeof filteredItems }>();

  for (const phone of filteredItems) {
    const catalog = phone.phone_catalog_id;
    const catalogId = catalog && typeof catalog === 'object' && '_id' in catalog ? String((catalog as { _id: unknown })._id) : String(catalog);

    const current = groupedMap.get(catalogId);

    if (current) {
      current.variants.push(phone);
    } else {
      groupedMap.set(catalogId, {
        catalog,
        variants: [phone],
      });
    }
  }

  return {
    message: 'Lấy danh sách điện thoại thành công!',
    count,
    visibleCount: filteredItems.length,
    groupedPhones: Array.from(groupedMap.values()),
  };
}

export async function getMostViewedPhonesData() {
  await connectDB();

  const phones = await PhoneModel.find({})
    .sort({ view: -1 })
    .limit(10)
    .populate({
      path: 'phone_catalog_id',
      select: '-createdAt -updatedAt -__v',
    })
    .lean();

  return {
    message: 'Lấy danh sách top 20 điện thoại thành công!',
    phones,
  };
}

export async function getAllPhonesFullData(query: Pick<PhoneQueryInput, 'page' | 'limit'>) {
  await connectDB();

  const page = query.page ? Math.max(Number(query.page), 1) : 1;
  const requestedLimit = query.limit ? Math.max(Number(query.limit), 1) : 50;
  const limit = Math.min(requestedLimit, 200);
  const skip = (page - 1) * limit;

  const [phones, totalItems] = await Promise.all([
    PhoneModel.find({})
      .populate({
        path: 'phone_catalog_id',
        select: '-__v -createdAt -updatedAt',
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    PhoneModel.countDocuments({}),
  ]);

  return {
    message: 'Lấy toàn bộ phones thành công',
    count: totalItems,
    pageCount: phones.length,
    pagination: buildPaginationMeta({
      page,
      limit,
      totalItems,
    }),
    phones,
  };
}

export async function getPhoneByIdData(id: string) {
  await connectDB();

  const phone = await PhoneModel.findById(id)
    .populate({
      path: 'phone_catalog_id',
      select: '-createdAt -updatedAt -__v',
    })
    .lean();

  if (!phone) return null;

  void PhoneModel.updateOne({ _id: phone._id }, { $inc: { view: 1 } }).exec();

  return {
    message: 'Lấy điện thoại theo id thành công!',
    phone,
  };
}

export async function getPhoneBySlugData(slug: string) {
  await connectDB();

  const phone = await PhoneModel.findOne({ slug })
    .populate({
      path: 'phone_catalog_id',
      select: '-createdAt -updatedAt -__v',
    })
    .lean();

  if (!phone) return null;

  void PhoneModel.updateOne({ _id: phone._id }, { $inc: { view: 1 } }).exec();

  return {
    message: 'Lấy điện thoại theo slug thành công!',
    phone,
  };
}
