import type { Metadata } from 'next';
import UsedProductCatalogClient from './UsedProductCatalogClient';
import type { UsedProduct, UsedProductCategory } from '@/types/type/used-product/used-product';
import { getUsedProductsByParentCategorySlug } from '@/services/used-product/usedProductService';

type SearchParams = Record<string, string | string[] | undefined>;

type PageProps = {
  // Next.js App Router: params must be a Promise in Next.js 15+.
  params: Promise<{ parentCategorySlug: string }>;
  searchParams?: Promise<SearchParams>;
};

function titleFromSlug(slug: string): string {
  return decodeURIComponent(slug)
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function slugFromCategory(category: string): string {
  return category
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function groupProductsByCategory(products: UsedProduct[]): UsedProductCategory[] {
  const groups = new Map<string, UsedProductCategory>();

  for (const product of products) {
    const name = product.category?.trim() || 'Khác';
    const slug = product.categorySlug?.trim() || slugFromCategory(name);
    if (!slug) continue;

    const key = slug.toLowerCase();
    const existing = groups.get(key);
    if (existing) {
      existing.count += 1;
      existing.products.push(product);
    } else {
      groups.set(key, { name, slug, count: 1, products: [product] });
    }
  }

  return [...groups.values()].sort((a, b) => a.name.localeCompare(b.name, 'vi'));
}

function getParentCategoryName(products: UsedProduct[], parentCategorySlug: string): string {
  return (
    products.find((product) => product.parentCategory?.trim())?.parentCategory?.trim() ||
    titleFromSlug(parentCategorySlug)
  );
}

export async function generateMetadata({ params }: Pick<PageProps, 'params'>): Promise<Metadata> {
  const { parentCategorySlug } = await params;
  const products = await getUsedProductsByParentCategorySlug(parentCategorySlug);
  const categoryName = getParentCategoryName(products, parentCategorySlug);

  return {
    title: `Laptop ${categoryName} cũ | 7Teck.vn`,
    description: `Danh sách laptop ${categoryName} đã qua sử dụng, phân loại theo dòng máy. Bảo hành 6 tháng, riêng màn hình và main 3 tháng; bao test 7 ngày 1 đổi 1.`,
  };
}

/** Dynamic route: the parent category and child categories are derived from external API data. */
export default async function UsedProductParentCategoryPage({
  params,
  searchParams,
}: PageProps) {
  const { parentCategorySlug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const rawSelectedCategory = resolvedSearchParams.category;
  const requestedCategorySlug = Array.isArray(rawSelectedCategory)
    ? rawSelectedCategory[0] ?? null
    : rawSelectedCategory ?? null;

  // Fetch the parent list once. Child-category filtering is performed against this same result,
  // rather than making a second API request with combined query params that may return no rows.
  const allProducts = await getUsedProductsByParentCategorySlug(parentCategorySlug);
  const categories = groupProductsByCategory(allProducts);
  const parentCategoryName = getParentCategoryName(allProducts, parentCategorySlug);

  const matchedCategory = requestedCategorySlug
    ? categories.find(
        (category) => category.slug.toLowerCase() === requestedCategorySlug.toLowerCase(),
      )
    : undefined;

  const selectedCategorySlug = matchedCategory?.slug ?? null;
  // Critical fix: use products already grouped from the parent API response.
  // This avoids an empty grid if the external API's combined filters do not match.
  const visibleProducts = matchedCategory?.products ?? allProducts;

  return (
    <UsedProductCatalogClient
      parentCategorySlug={parentCategorySlug}
      parentCategoryName={parentCategoryName}
      allProducts={allProducts}
      visibleProducts={visibleProducts}
      categories={categories}
      selectedCategorySlug={selectedCategorySlug}
    />
  );
}
