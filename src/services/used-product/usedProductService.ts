import { UsedProduct } from '@/types/type/used-product/used-product';
import { getUsedProductsApiUrl } from '../../../hooks/useUsedProductsApiUrl';

type UnknownRecord = Record<string, unknown>;

const REVALIDATE_SECONDS = 60;

function isRecord(value: unknown): value is UnknownRecord {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function normalizeProduct(value: unknown): UsedProduct | null {
  if (!isRecord(value)) return null;

  const slug = asString(value.slug).trim();
  const name = asString(value.name).trim();
  const id = asString(value._id, asString(value.id, slug)).trim();
  if (!id || !slug || !name) return null;

  const numericPrice = typeof value.price === 'number' ? value.price : Number.parseFloat(asString(value.price, '0'));

  return {
    _id: id,
    name,
    slug,
    sourceProductId: typeof value.sourceProductId === 'string' ? value.sourceProductId : null,
    description: asString(value.description),
    price: Number.isFinite(numericPrice) ? numericPrice : 0,
    priceText: asString(value.priceText),
    category: asString(value.category, 'Khác'),
    categorySlug: typeof value.categorySlug === 'string' ? value.categorySlug : null,
    parentCategory: typeof value.parentCategory === 'string' ? value.parentCategory : null,
    parentCategorySlug: typeof value.parentCategorySlug === 'string' ? value.parentCategorySlug : null,
    images: Array.isArray(value.images) ? value.images : [],
    status: asString(value.status, 'active'),
    pin: asString(value.pin),
    isDone: value.isDone === true,
    doneAt: typeof value.doneAt === 'string' ? value.doneAt : null,
    createdAt: typeof value.createdAt === 'string' ? value.createdAt : undefined,
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : undefined,
  };
}

function extractProducts(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!isRecord(payload)) return [];

  if (Array.isArray(payload.products)) return payload.products;
  if (Array.isArray(payload.items)) return payload.items;

  // Keep support for APIs that wrap the list in `data`.
  if (isRecord(payload.data)) {
    if (Array.isArray(payload.data.products)) return payload.data.products;
    if (Array.isArray(payload.data.items)) return payload.data.items;
  }

  return [];
}

async function fetchJson(apiPath: string): Promise<unknown | null> {
  try {
    const response = await fetch(getUsedProductsApiUrl(apiPath), {
      cache: 'force-cache',
      next: { revalidate: REVALIDATE_SECONDS },
    });

    if (!response.ok) {
      console.error(`[usedProductService] API ${apiPath} failed: ${response.status} ${response.statusText}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`[usedProductService] Could not fetch ${apiPath}:`, error);
    return null;
  }
}

async function fetchUsedProducts(query: URLSearchParams): Promise<UsedProduct[]> {
  const queryString = query.toString();
  const apiPath = `/api/used-products${queryString ? `?${queryString}` : ''}`;
  const payload = await fetchJson(apiPath);
  return extractProducts(payload)
    .map(normalizeProduct)
    .filter((product): product is UsedProduct => product !== null);
}

/**
 * Get all used products belonging to a parent category.
 * Example request: /api/used-products?parentCategorySlug=dell
 */
export async function getUsedProductsByParentCategorySlug(parentCategorySlug: string): Promise<UsedProduct[]> {
  const normalizedParentSlug = parentCategorySlug?.trim().toLowerCase();
  if (!normalizedParentSlug) return [];

  return fetchUsedProducts(new URLSearchParams({ parentCategorySlug: normalizedParentSlug }));
}

/**
 * Get all used products in a child category.
 * Example request: /api/used-products?categorySlug=dell-latitude&parentCategorySlug=dell
 */
export async function getUsedProductsByCategorySlug(categorySlug: string, parentCategorySlug?: string): Promise<UsedProduct[]> {
  const normalizedCategorySlug = categorySlug?.trim().toLowerCase();
  if (!normalizedCategorySlug) return [];

  const query = new URLSearchParams({ categorySlug: normalizedCategorySlug });
  if (parentCategorySlug?.trim()) {
    query.set('parentCategorySlug', parentCategorySlug.trim().toLowerCase());
  }

  return fetchUsedProducts(query);
}

/**
 * Get one used product by its product slug (NOT categorySlug).
 * Example request:
 * /api/used-products?slug=dell-latitude-7420-14-inch-fhd-i7-1185g7-16gb-512gb
 * Expected response shape: { ok: true, product: { ... } }
 */
export async function getUsedProductBySlug(slug: string): Promise<UsedProduct | null> {
  const normalizedSlug = slug?.trim();
  if (!normalizedSlug) return null;

  const query = new URLSearchParams({ slug: normalizedSlug });
  const payload = await fetchJson(`/api/used-products?${query.toString()}`);
  if (!isRecord(payload)) return null;

  // Current source API response is { ok: true, product: { ... } }.
  const directProduct = normalizeProduct(payload.product);
  if (directProduct && directProduct.slug.toLowerCase() === normalizedSlug.toLowerCase()) {
    return directProduct;
  }

  // Compatibility fallbacks if the source API response wrapper changes.
  if (isRecord(payload.data)) {
    const nestedProduct = normalizeProduct(payload.data.product);
    if (nestedProduct && nestedProduct.slug.toLowerCase() === normalizedSlug.toLowerCase()) {
      return nestedProduct;
    }
  }

  const products = extractProducts(payload)
    .map(normalizeProduct)
    .filter((product): product is UsedProduct => product !== null);
  return products.find((product) => product.slug.toLowerCase() === normalizedSlug.toLowerCase()) ?? null;
}
