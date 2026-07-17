import '@/server/models/registerCatalogModels';
import { connectDB } from '@/lib/mongodb';
import MacbookModel from '@/server/models/macbook.model';
import { getStatusFromAlias, matchesCatalogStatus } from '@/server/utils/api/catalogStatusFilter';

export type MacbookQueryInput = {
  catalogID?: string;
  name?: string;
  status?: string;
  m_cat_status?: string;
};

type MacbookCatalogLike = {
  _id?: unknown;
  m_cat_status?: number;
};

type MacbookLike = {
  _id?: unknown;
  macbook_catalog_id?: MacbookCatalogLike | unknown;
};

function buildMacbookBaseQuery(query: MacbookQueryInput): Record<string, unknown> {
  const filterQuery: Record<string, unknown> = {};

  if (query.catalogID) {
    filterQuery.macbook_catalog_id = query.catalogID;
  }

  if (query.name) {
    filterQuery.macbook_name = { $regex: query.name, $options: 'i' };
  }

  return filterQuery;
}

function getMacbookCatalog(item: MacbookLike): MacbookCatalogLike | undefined {
  const catalog = item.macbook_catalog_id;

  if (!catalog || typeof catalog !== 'object') return undefined;

  return catalog as MacbookCatalogLike;
}

function filterMacbookByCatalogStatus<T extends MacbookLike>(items: T[], query: MacbookQueryInput): T[] {
  const status = getStatusFromAlias(query, 'm_cat_status');

  return items.filter((item) => {
    const catalog = getMacbookCatalog(item);
    return matchesCatalogStatus(catalog?.m_cat_status, status);
  });
}

export async function getMacbookData(query: MacbookQueryInput) {
  await connectDB();

  const filterQuery = buildMacbookBaseQuery(query);

  const macbook = await MacbookModel.find(filterQuery)
    .sort({ updatedAt: -1 })
    .populate({
      path: 'macbook_catalog_id',
      select: '-createdAt -updatedAt -__v',
    })
    .lean();

  const filteredItems = filterMacbookByCatalogStatus(macbook, query);
  const count = await MacbookModel.countDocuments(filterQuery);

  return {
    message: 'Lấy danh sách macbook thành công!',
    count,
    visibleCount: filteredItems.length,
    macbook: filteredItems,
  };
}

export async function getGroupedMacbookData(query: MacbookQueryInput) {
  await connectDB();

  const filterQuery: Record<string, unknown> = {};

  if (query.name) {
    filterQuery.macbook_name = { $regex: query.name, $options: 'i' };
  }

  if (query.catalogID) {
    filterQuery.macbook_catalog_id = query.catalogID;
  }

  const macbook = await MacbookModel.find(filterQuery)
    .populate({
      path: 'macbook_catalog_id',
      select: '-createdAt -updatedAt -__v',
    })
    .lean();

  const filteredItems = filterMacbookByCatalogStatus(macbook, query);
  const count = await MacbookModel.countDocuments();

  const groupedMap = new Map<string, { catalog: unknown; variants: typeof filteredItems }>();

  for (const mac of filteredItems) {
    const catalog = mac.macbook_catalog_id;
    const catalogId =
      catalog && typeof catalog === 'object' && '_id' in catalog ? String((catalog as { _id: unknown })._id) : String(catalog);

    const current = groupedMap.get(catalogId);

    if (current) {
      current.variants.push(mac);
    } else {
      groupedMap.set(catalogId, {
        catalog,
        variants: [mac],
      });
    }
  }

  return {
    message: 'Lấy danh sách Macbook thành công!',
    count,
    visibleCount: filteredItems.length,
    groupedMacbook: Array.from(groupedMap.values()),
  };
}

export async function getMacbookByIdData(id: string) {
  await connectDB();

  const macbook = await MacbookModel.findById(id)
    .populate({
      path: 'macbook_catalog_id',
      select: '-createdAt -updatedAt -__v',
    })
    .lean();

  if (!macbook) return null;

  return {
    message: 'Lấy sản phẩm Macbook theo id thành công!',
    macbook,
  };
}

export async function getMacbookBySlugData(slug: string) {
  await connectDB();

  const macbook = await MacbookModel.findOne({ macbook_slug: slug })
    .populate({
      path: 'macbook_catalog_id',
      select: '-createdAt -updatedAt -__v',
    })
    .lean();

  if (!macbook) return null;

  return {
    message: 'Lấy sản phẩm Macbook theo slug thành công!',
    macbook,
  };
}
