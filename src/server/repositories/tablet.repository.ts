import '@/server/models/registerCatalogModels';
import { connectDB } from '@/lib/mongodb';
import TabletModel from '@/server/models/tablet.model';
import { getStatusFromAlias, matchesCatalogStatus } from '@/server/utils/api/catalogStatusFilter';

export type TabletQueryInput = {
  catalogID?: string;
  name?: string;
  status?: string;
  t_cat_status?: string;
};

type TabletCatalogLike = {
  _id?: unknown;
  t_cat_status?: number;
};

type TabletLike = {
  _id?: unknown;
  tablet_catalog_id?: TabletCatalogLike | unknown;
};

function buildTabletBaseQuery(query: TabletQueryInput): Record<string, unknown> {
  const filterQuery: Record<string, unknown> = {};

  if (query.catalogID) {
    filterQuery.tablet_catalog_id = query.catalogID;
  }

  if (query.name) {
    filterQuery.tablet_name = { $regex: query.name, $options: 'i' };
  }

  return filterQuery;
}

function getTabletCatalog(item: TabletLike): TabletCatalogLike | undefined {
  const catalog = item.tablet_catalog_id;

  if (!catalog || typeof catalog !== 'object') return undefined;

  return catalog as TabletCatalogLike;
}

function filterTabletsByCatalogStatus<T extends TabletLike>(items: T[], query: TabletQueryInput): T[] {
  const status = getStatusFromAlias(query, 't_cat_status');

  return items.filter((item) => {
    const catalog = getTabletCatalog(item);
    return matchesCatalogStatus(catalog?.t_cat_status, status);
  });
}

export async function getTabletsData(query: TabletQueryInput) {
  await connectDB();

  const filterQuery = buildTabletBaseQuery(query);

  const tablets = await TabletModel.find(filterQuery)
    .sort({ updatedAt: -1 })
    .populate({
      path: 'tablet_catalog_id',
      select: '-createdAt -updatedAt -__v',
    })
    .lean();

  const filteredItems = filterTabletsByCatalogStatus(tablets, query);
  const count = await TabletModel.countDocuments(filterQuery);

  return {
    message: 'Lấy danh sách máy tính bảng thành công!',
    count,
    visibleCount: filteredItems.length,
    tablets: filteredItems,
  };
}

export async function getGroupedTabletsData(query: TabletQueryInput) {
  await connectDB();

  const filterQuery: Record<string, unknown> = {};

  if (query.name) {
    filterQuery.tablet_name = { $regex: query.name, $options: 'i' };
  }

  if (query.catalogID) {
    filterQuery.tablet_catalog_id = query.catalogID;
  }

  const tablets = await TabletModel.find(filterQuery)
    .populate({
      path: 'tablet_catalog_id',
      select: '-createdAt -updatedAt -__v',
    })
    .lean();

  const filteredItems = filterTabletsByCatalogStatus(tablets, query);
  const count = await TabletModel.countDocuments();

  const groupedMap = new Map<string, { catalog: unknown; variants: typeof filteredItems }>();

  for (const tablet of filteredItems) {
    const catalog = tablet.tablet_catalog_id;
    const catalogId =
      catalog && typeof catalog === 'object' && '_id' in catalog ? String((catalog as { _id: unknown })._id) : String(catalog);

    const current = groupedMap.get(catalogId);

    if (current) {
      current.variants.push(tablet);
    } else {
      groupedMap.set(catalogId, {
        catalog,
        variants: [tablet],
      });
    }
  }

  return {
    message: 'Lấy danh sách máy tính bảng thành công!',
    count,
    visibleCount: filteredItems.length,
    groupedTablets: Array.from(groupedMap.values()),
  };
}

export async function getTabletByIdData(id: string) {
  await connectDB();

  const tablet = await TabletModel.findById(id)
    .sort({ updatedAt: -1 })
    .populate({
      path: 'tablet_catalog_id',
      select: '-createdAt -updatedAt -__v',
    })
    .lean();

  if (!tablet) return null;

  return {
    message: 'Lấy máy tính bảng theo id thành công!',
    tablet,
  };
}

export async function getTabletBySlugData(slug: string) {
  await connectDB();

  const tablet = await TabletModel.findOne({ tablet_slug: slug })
    .populate({
      path: 'tablet_catalog_id',
      select: '-createdAt -updatedAt -__v',
    })
    .lean();

  if (!tablet) return null;

  return {
    message: 'Lấy máy tính bảng theo slug thành công!',
    tablet,
  };
}
