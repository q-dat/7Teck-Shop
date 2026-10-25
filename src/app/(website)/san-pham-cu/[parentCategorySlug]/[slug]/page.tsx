import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FaArrowLeft, FaCheckCircle, FaExchangeAlt, FaLaptop, FaShieldAlt } from 'react-icons/fa';
import { formatCurrency } from '@/utils/formatCurrency';
import UsedProductCatalogClient from '../UsedProductCatalogClient';
import type { UsedProduct, UsedProductCategory } from '@/types/type/used-product/used-product';
import {
  getUsedProductBySlug,
  getUsedProductsByCategorySlug,
  getUsedProductsByParentCategorySlug,
} from '@/services/used-product/usedProductService';

type PageProps = {
  params: Promise<{ parentCategorySlug: string; slug: string }>;
};

const EXCLUDED_STATUSES = ['inactive', 'hidden', 'disabled', 'hết hàng', 'ngừng kinh doanh', 'ngưng bán', 'sold'];

function titleFromSlug(slug: string): string {
  return decodeURIComponent(slug)
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function slugFromCategory(value: string): string {
  return value
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

function parentCategoryName(products: UsedProduct[], parentCategorySlug: string): string {
  return products.find((product) => product.parentCategory?.trim())?.parentCategory?.trim()
    || titleFromSlug(parentCategorySlug);
}

function isProductInParent(product: UsedProduct, parentCategorySlug: string): boolean {
  const storedParentSlug = product.parentCategorySlug?.trim().toLowerCase();
  const fallbackParentSlug = product.parentCategory ? slugFromCategory(product.parentCategory) : '';
  const resolvedParentSlug = storedParentSlug || fallbackParentSlug;
  return !resolvedParentSlug || resolvedParentSlug === parentCategorySlug.trim().toLowerCase();
}

function getProductImageSources(images: unknown[]): string[] {
  const sources: string[] = [];
  for (const item of images) {
    if (typeof item === 'string' && item.trim()) {
      sources.push(item.trim());
      continue;
    }
    if (item && typeof item === 'object') {
      const record = item as Record<string, unknown>;
      const src = record.url ?? record.src ?? record.dataUrl;
      if (typeof src === 'string' && src.trim()) sources.push(src.trim());
    }
  }
  return [...new Set(sources)];
}

function isUnavailable(product: UsedProduct): boolean {
  return product.isDone === true || EXCLUDED_STATUSES.includes((product.status ?? '').trim().toLowerCase());
}

function productPrice(product: UsedProduct): string {
  return product.priceText?.trim() || (product.price > 0 ? formatCurrency(product.price) : 'Liên hệ');
}

function UsedProductDetail({ product, parentCategorySlug }: { product: UsedProduct; parentCategorySlug: string }) {
  const images = getProductImageSources(product.images);
  const price = productPrice(product);
  const unavailable = isUnavailable(product);
  const categorySlug = product.categorySlug || slugFromCategory(product.category || '');
  const categoryHref = `/san-pham-cu/${encodeURIComponent(parentCategorySlug)}/${encodeURIComponent(categorySlug)}`;
  const parentHref = `/san-pham-cu/${encodeURIComponent(parentCategorySlug)}`;

  return (
    <main className="min-h-screen bg-slate-50 pb-12">
      <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-2 text-xs text-slate-500 sm:text-sm">
          <Link href="/" className="hover:text-primary">Trang chủ</Link>
          <span aria-hidden="true">/</span>
          <Link href={parentHref} className="hover:text-primary">Laptop {product.parentCategory || parentCategorySlug} cũ</Link>
          <span aria-hidden="true">/</span>
          <Link href={categoryHref} className="hover:text-primary">{product.category}</Link>
          <span aria-hidden="true">/</span>
          <span className="font-medium text-slate-800">{product.name}</span>
        </nav>

        <Link href={parentHref} className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
          <FaArrowLeft aria-hidden="true" /> Quay lại danh mục máy cũ
        </Link>

        <section className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:grid-cols-2 lg:gap-10 lg:p-8">
          <div>
            <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl bg-slate-50 p-4">
              {images[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={images[0]} alt={product.name} className="h-full w-full object-contain" />
              ) : (
                <FaLaptop className="text-7xl text-slate-300" aria-hidden="true" />
              )}
            </div>
            {images.length > 1 && (
              <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5">
                {images.slice(1, 6).map((src) => (
                  <div key={src} className="flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white p-1.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={`${product.name} - hình ảnh`} loading="lazy" className="h-full w-full object-contain" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-primary">{product.category || 'Laptop cũ'}</p>
            <h1 className="text-2xl font-bold leading-tight text-slate-950 sm:text-3xl">{product.name}</h1>
            <p className="mt-3 text-2xl font-extrabold text-rose-600 sm:text-3xl">{price}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">Đã qua sử dụng</span>
              {unavailable && <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">{product.isDone ? 'Đã bán' : 'Tạm ngưng kinh doanh'}</span>}
            </div>

            <div className="mt-6 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start gap-3"><FaShieldAlt className="mt-0.5 text-emerald-600" /><div><p className="text-sm font-bold text-slate-900">Bảo hành 6 tháng</p><p className="mt-0.5 text-xs text-slate-600">Riêng màn hình và main: 3 tháng</p></div></div>
              <div className="flex items-start gap-3"><FaCheckCircle className="mt-0.5 text-blue-600" /><div><p className="text-sm font-bold text-slate-900">Bao test 7 ngày</p><p className="mt-0.5 text-xs text-slate-600">Có thời gian kiểm tra máy sau khi nhận</p></div></div>
              <div className="flex items-start gap-3"><FaExchangeAlt className="mt-0.5 text-rose-600" /><div><p className="text-sm font-bold text-slate-900">1 đổi 1</p><p className="mt-0.5 text-xs text-slate-600">Áp dụng theo chính sách bao test 7 ngày</p></div></div>
            </div>

            {product.description?.trim() && (
              <div className="mt-6">
                <h2 className="text-base font-bold text-slate-900">Mô tả sản phẩm</h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">{product.description}</p>
              </div>
            )}

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <Link href={categoryHref} className="inline-flex min-h-11 items-center justify-center rounded-lg border border-primary px-4 py-3 text-sm font-bold text-primary transition hover:bg-primary/5">Xem máy cùng dòng</Link>
              <Link href={parentHref} className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white transition hover:opacity-90">Tất cả laptop {product.parentCategory || parentCategorySlug} cũ</Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

async function resolveNestedData(parentCategorySlug: string, slug: string) {
  const normalizedParentSlug = parentCategorySlug.trim().toLowerCase();
  const normalizedSlug = slug.trim().toLowerCase();

  const parentProducts = await getUsedProductsByParentCategorySlug(normalizedParentSlug);
  const parentCategories = groupProductsByCategory(parentProducts);
  const parentName = parentCategoryName(parentProducts, normalizedParentSlug);

  // 1. Resolve child category from the parent API list first.
  // Example: /san-pham-cu/dell/dell-latitude
  const existingCategory = parentCategories.find(
    (item) => item.slug.trim().toLowerCase() === normalizedSlug,
  );
  if (existingCategory) {
    return {
      kind: 'category' as const,
      parentProducts,
      categories: parentCategories,
      parentName,
      category: existingCategory,
      products: existingCategory.products,
    };
  }

  // 2. A slug that was not a child category is checked against the dedicated product-slug API.
  // Current external API returns { ok: true, product: { _id, slug, categorySlug, ... } }.
  // Example: /api/used-products?slug=dell-latitude-7420-14-inch-fhd-i7-1185g7-16gb-512gb
  const productFromSlugApi = await getUsedProductBySlug(slug);
  const productFromParent = parentProducts.find(
    (item) => item.slug.trim().toLowerCase() === normalizedSlug,
  ) ?? null;
  const product = productFromSlugApi ?? productFromParent;

  if (product && isProductInParent(product, normalizedParentSlug)) {
    return {
      kind: 'product' as const,
      parentProducts,
      categories: parentCategories,
      parentName,
      product,
    };
  }

  // 3. If neither the parent list nor the product slug API recognized it, try it as a categorySlug.
  // Example: /api/used-products?categorySlug=dell-latitude&parentCategorySlug=dell
  const directCategoryProducts = await getUsedProductsByCategorySlug(slug, normalizedParentSlug);
  const scopedCategoryProducts = directCategoryProducts.filter((item) => {
    const storedParentSlug = item.parentCategorySlug?.trim().toLowerCase();
    return !storedParentSlug || storedParentSlug === normalizedParentSlug;
  });

  if (scopedCategoryProducts.length > 0) {
    const foundCategory = groupProductsByCategory(scopedCategoryProducts)[0];
    const category = foundCategory
      ? {
          ...foundCategory,
          slug: normalizedSlug,
          count: scopedCategoryProducts.length,
          products: scopedCategoryProducts,
        }
      : {
          name: scopedCategoryProducts[0]?.category?.trim() || titleFromSlug(slug),
          slug: normalizedSlug,
          count: scopedCategoryProducts.length,
          products: scopedCategoryProducts,
        };

    const categories = parentCategories.some((item) => item.slug.toLowerCase() === normalizedSlug)
      ? parentCategories
      : [...parentCategories, category].sort((a, b) => a.name.localeCompare(b.name, 'vi'));

    return {
      kind: 'category' as const,
      parentProducts,
      categories,
      parentName,
      category,
      products: scopedCategoryProducts,
    };
  }

  return {
    kind: 'not-found' as const,
    parentProducts,
    categories: parentCategories,
    parentName,
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { parentCategorySlug, slug } = await params;
  const resolved = await resolveNestedData(parentCategorySlug, slug);

  if (resolved.kind === 'category') {
    return {
      title: `Laptop ${resolved.category.name} cũ | 7Teck.vn`,
      description: `Danh sách laptop ${resolved.category.name} đã qua sử dụng. Bảo hành 6 tháng, riêng màn hình và main 3 tháng; bao test 7 ngày 1 đổi 1.`,
    };
  }

  if (resolved.kind === 'product') {
    return {
      title: `${resolved.product.name} - Laptop cũ | 7Teck.vn`,
      description: resolved.product.description?.trim().slice(0, 155) || `${resolved.product.name}. Bảo hành 6 tháng, riêng màn hình và main 3 tháng; bao test 7 ngày 1 đổi 1.`,
    };
  }

  return { title: `${titleFromSlug(slug)} | Laptop cũ 7Teck.vn` };
}

/**
 * Dynamic route for both child categories and used-product detail pages.
 * Resolve the category before the product, because child-category links also use this segment.
 */
export default async function UsedProductNestedRoutePage({ params }: PageProps) {
  const { parentCategorySlug, slug } = await params;
  const resolved = await resolveNestedData(parentCategorySlug, slug);

  if (resolved.kind === 'category') {
    const allProducts = resolved.parentProducts.length > 0
      ? resolved.parentProducts
      : resolved.products;

    return (
      <UsedProductCatalogClient
        parentCategorySlug={parentCategorySlug}
        parentCategoryName={resolved.parentName}
        allProducts={allProducts}
        visibleProducts={resolved.products}
        categories={resolved.categories}
        selectedCategorySlug={resolved.category.slug}
      />
    );
  }

  if (resolved.kind === 'product') {
    return <UsedProductDetail product={resolved.product} parentCategorySlug={parentCategorySlug} />;
  }

  notFound();
}
