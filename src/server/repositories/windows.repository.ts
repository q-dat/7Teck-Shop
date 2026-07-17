import '@/server/models/registerCatalogModels';
import { connectDB } from '@/lib/mongodb';
import WindowsModel from '@/server/models/windows.model';
import { getStatusFromAlias, matchesCatalogStatus } from '@/server/utils/api/catalogStatusFilter';

export type WindowsQueryInput = {
  catalogID?: string;
  name?: string;
  status?: string;
  w_cat_status?: string;
};

type WindowsCatalogLike = {
  _id?: unknown;
  w_cat_status?: number;
};

type WindowsLike = {
  _id?: unknown;
  windows_catalog_id?: WindowsCatalogLike | unknown;
};

function buildWindowsBaseQuery(query: WindowsQueryInput): Record<string, unknown> {
  const filterQuery: Record<string, unknown> = {};

  if (query.catalogID) {
    filterQuery.windows_catalog_id = query.catalogID;
  }

  if (query.name) {
    filterQuery.windows_name = { $regex: query.name, $options: 'i' };
  }

  return filterQuery;
}

function getWindowsCatalog(item: WindowsLike): WindowsCatalogLike | undefined {
  const catalog = item.windows_catalog_id;

  if (!catalog || typeof catalog !== 'object') return undefined;

  return catalog as WindowsCatalogLike;
}

function filterWindowsByCatalogStatus<T extends WindowsLike>(items: T[], query: WindowsQueryInput): T[] {
  const status = getStatusFromAlias(query, 'w_cat_status');

  return items.filter((item) => {
    const catalog = getWindowsCatalog(item);
    return matchesCatalogStatus(catalog?.w_cat_status, status);
  });
}

export async function getWindowsData(query: WindowsQueryInput) {
  await connectDB();

  const filterQuery = buildWindowsBaseQuery(query);

  const windows = await WindowsModel.find(filterQuery)
    .sort({ updatedAt: -1 })
    .populate({
      path: 'windows_catalog_id',
      select: '-createdAt -updatedAt -__v',
    })
    .lean();

  const filteredItems = filterWindowsByCatalogStatus(windows, query);
  const count = await WindowsModel.countDocuments(filterQuery);

  return {
    message: 'Lấy danh sách windows thành công!',
    count,
    visibleCount: filteredItems.length,
    windows: filteredItems,
  };
}

export async function getGroupedWindowsData(query: WindowsQueryInput) {
  await connectDB();

  const filterQuery: Record<string, unknown> = {};

  if (query.name) {
    filterQuery.windows_name = { $regex: query.name, $options: 'i' };
  }

  if (query.catalogID) {
    filterQuery.windows_catalog_id = query.catalogID;
  }

  const windows = await WindowsModel.find(filterQuery)
    .populate({
      path: 'windows_catalog_id',
      select: '-createdAt -updatedAt -__v',
    })
    .lean();

  const filteredItems = filterWindowsByCatalogStatus(windows, query);
  const count = await WindowsModel.countDocuments();

  const groupedMap = new Map<string, { catalog: unknown; variants: typeof filteredItems }>();

  for (const win of filteredItems) {
    const catalog = win.windows_catalog_id;
    const catalogId =
      catalog && typeof catalog === 'object' && '_id' in catalog ? String((catalog as { _id: unknown })._id) : String(catalog);

    const current = groupedMap.get(catalogId);

    if (current) {
      current.variants.push(win);
    } else {
      groupedMap.set(catalogId, {
        catalog,
        variants: [win],
      });
    }
  }

  return {
    message: 'Lấy danh sách Windows thành công!',
    count,
    visibleCount: filteredItems.length,
    groupedWindows: Array.from(groupedMap.values()),
  };
}

export async function getWindowsByIdData(id: string) {
  await connectDB();

  const windows = await WindowsModel.findById(id)
    .populate({
      path: 'windows_catalog_id',
      select: '-createdAt -updatedAt -__v',
    })
    .lean();

  if (!windows) return null;

  return {
    message: 'Lấy sản phẩm Windows theo id thành công!',
    windows,
  };
}

export async function getWindowsBySlugData(slug: string) {
  await connectDB();

  const windows = await WindowsModel.findOne({ windows_slug: slug })
    .populate({
      path: 'windows_catalog_id',
      select: '-createdAt -updatedAt -__v',
    })
    .lean();

  if (!windows) return null;

  return {
    message: 'Lấy sản phẩm Windows theo slug thành công!',
    windows,
  };
}
