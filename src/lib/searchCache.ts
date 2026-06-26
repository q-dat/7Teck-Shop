import type { Model, Types } from 'mongoose';

import PhoneModel from '@/server/models/phone.model';
import TabletModel from '@/server/models/tablet.model';
import MacbookModel from '@/server/models/macbook.model';
import WindowsModel from '@/server/models/windows.model';
import { connectDB } from './mongodb';

export const keywordMap: Record<string, string> = {
  ip: 'iphone',
  ip14: 'iphone 14',
  ip15: 'iphone 15',
  ip16: 'iphone 16',
  ip17: 'iphone 17',
  ss: 'samsung',
  mb: 'macbook',
  mtb: 'ipad',
  wm: 'windows',
  gb: 'gb',
  pr: 'pro',
  prx: 'promax',
  prm: 'promax',
  pm: 'promax',
  pls: 'plus',
  pl: 'plus',
};

export type CachedItem = {
  _id: string;
  name: string;
  slug: string;
  link: string;
  image: string;
  color?: string;
  price?: number;
  sale?: number;
  status?: string;
  catalogId?: string;
};

type RawId = string | Types.ObjectId | { toString(): string };

type RawItem = {
  _id: RawId;
  [key: string]: unknown;
};

type CollectionConfig = {
  nameField: string;
  slugField: string;
  url: string;
  imageField: string;
  colorField: string;
  priceField: string;
  saleField: string;
  statusField: string;
  catalogField: string;
  findItems: () => Promise<RawItem[]>;
};

let CACHE: CachedItem[] = [];
let lastLoaded = 0;

const CACHE_TTL = 60 * 1000;

function getSelectFields(config: Omit<CollectionConfig, 'findItems'>): string {
  return [
    config.nameField,
    config.slugField,
    config.imageField,
    config.colorField,
    config.priceField,
    config.saleField,
    config.statusField,
    config.catalogField,
    '_id',
  ].join(' ');
}

function createCollectionConfig<TSchema extends object>(model: Model<TSchema>, config: Omit<CollectionConfig, 'findItems'>): CollectionConfig {
  return {
    ...config,
    findItems: async () => {
      const items = await model.find({}).select(getSelectFields(config)).lean().exec();

      return items as unknown as RawItem[];
    },
  };
}

const COLLECTIONS: CollectionConfig[] = [
  createCollectionConfig(PhoneModel, {
    nameField: 'name',
    slugField: 'slug',
    url: '/dien-thoai',
    imageField: 'img',
    colorField: 'color',
    priceField: 'price',
    saleField: 'sale',
    statusField: 'status',
    catalogField: 'phone_catalog_id',
  }),

  createCollectionConfig(TabletModel, {
    nameField: 'tablet_name',
    slugField: 'tablet_slug',
    url: '/may-tinh-bang',
    imageField: 'tablet_img',
    colorField: 'tablet_color',
    priceField: 'tablet_price',
    saleField: 'tablet_sale',
    statusField: 'tablet_status',
    catalogField: 'tablet_catalog_id',
  }),

  createCollectionConfig(MacbookModel, {
    nameField: 'macbook_name',
    slugField: 'macbook_slug',
    url: '/macbook',
    imageField: 'macbook_img',
    colorField: 'macbook_color',
    priceField: 'macbook_price',
    saleField: 'macbook_sale',
    statusField: 'macbook_status',
    catalogField: 'macbook_catalog_id',
  }),

  createCollectionConfig(WindowsModel, {
    nameField: 'windows_name',
    slugField: 'windows_slug',
    url: '/windows',
    imageField: 'windows_img',
    colorField: 'windows_color',
    priceField: 'windows_price',
    saleField: 'windows_sale',
    statusField: 'windows_status',
    catalogField: 'windows_catalog_id',
  }),
];

function getNestedValue(obj: unknown, path: string): unknown {
  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (typeof current !== 'object' || current === null || !(key in current)) {
      return undefined;
    }

    current = (current as Record<string, unknown>)[key];
  }

  return current;
}

function getStringValue(obj: RawItem, field: string): string | undefined {
  const value = getNestedValue(obj, field);

  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

function getNumberValue(obj: RawItem, field: string): number | undefined {
  const value = getNestedValue(obj, field);

  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function getIdValue(obj: RawItem, field: string): string | undefined {
  const value = getNestedValue(obj, field);

  if (!value) {
    return undefined;
  }

  return String(value);
}

function createProductLink(url: string, slug: string, id: RawId): string {
  return `${url}/${encodeURIComponent(slug)}/${String(id)}`;
}

export async function loadCache(): Promise<void> {
  await connectDB();

  const allItems: CachedItem[] = [];

  for (const collection of COLLECTIONS) {
    const items = await collection.findItems();

    for (const item of items) {
      const name = getStringValue(item, collection.nameField);
      const slug = getStringValue(item, collection.slugField);

      if (!name || !slug) {
        continue;
      }

      const image = getStringValue(item, collection.imageField) ?? '';
      const color = getStringValue(item, collection.colorField);
      const price = getNumberValue(item, collection.priceField);
      const sale = getNumberValue(item, collection.saleField);
      const status = getStringValue(item, collection.statusField);
      const catalogId = getIdValue(item, collection.catalogField);

      allItems.push({
        _id: String(item._id),
        name,
        slug,
        link: createProductLink(collection.url, slug, item._id),
        image,
        color,
        price,
        sale,
        status,
        catalogId,
      });
    }
  }

  CACHE = allItems;
  lastLoaded = Date.now();

  console.log(`Cache loaded: ${CACHE.length} items`);
}

export async function getCache(): Promise<CachedItem[]> {
  const isCacheValid = Date.now() - lastLoaded < CACHE_TTL;

  if (isCacheValid && CACHE.length > 0) {
    return CACHE;
  }

  await loadCache();

  return CACHE;
}
