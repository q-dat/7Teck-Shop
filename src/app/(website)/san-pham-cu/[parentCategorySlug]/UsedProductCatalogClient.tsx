'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { FaBoxOpen, FaCheckCircle, FaExchangeAlt, FaLaptop, FaShieldAlt } from 'react-icons/fa';
import { formatCurrency } from '@/utils/formatCurrency';
import { UsedProduct, UsedProductCategory } from '@/types/type/used-product/used-product';

interface UsedProductCatalogClientProps {
  parentCategorySlug: string;
  parentCategoryName: string;
  allProducts: UsedProduct[];
  visibleProducts: UsedProduct[];
  categories: UsedProductCategory[];
  selectedCategorySlug: string | null;
}

const EXCLUDED_STATUSES = ['inactive', 'hidden', 'disabled', 'hết hàng', 'ngừng kinh doanh', 'ngưng bán', 'sold'];

function getImageSource(images: unknown[]): string | null {
  for (const item of images) {
    if (typeof item === 'string' && item.trim()) return item.trim();
    if (item && typeof item === 'object') {
      const record = item as Record<string, unknown>;
      const candidate = record.url ?? record.src ?? record.dataUrl;
      if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
    }
  }
  return null;
}

function isUnavailable(product: UsedProduct): boolean {
  return product.isDone === true || EXCLUDED_STATUSES.includes((product.status ?? '').trim().toLowerCase());
}

function ProductImage({ product }: { product: UsedProduct }) {
  const [hasError, setHasError] = useState(false);
  const src = getImageSource(product.images);

  if (!src || hasError) {
    return (
      <div className="flex aspect-[4/3] w-full items-center justify-center bg-slate-50 text-slate-300">
        <FaLaptop className="text-5xl" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className="aspect-[4/3] w-full overflow-hidden bg-white p-3">
      {/* Images come from the external Used Products API; plain img avoids requiring its host in next.config. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={product.name}
        loading="lazy"
        className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.04]"
        onError={() => setHasError(true)}
      />
    </div>
  );
}

function ProductCard({ product, parentCategorySlug }: { product: UsedProduct; parentCategorySlug: string }) {
  const unavailable = isUnavailable(product);
  const productHref = `/san-pham-cu/${encodeURIComponent(parentCategorySlug)}/${encodeURIComponent(product.slug)}`;
  const priceLabel = product.priceText?.trim() || (product.price > 0 ? formatCurrency(product.price) : 'Liên hệ');

  return (
    <article className="group relative flex min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg">
      <Link href={productHref} className="relative block" aria-label={`Xem ${product.name}`}>
        <ProductImage product={product} />
        <div className="absolute left-2 top-2 flex flex-wrap gap-1">
          <span className="rounded-full bg-slate-900/85 px-2 py-1 text-[10px] font-semibold text-white">Đã qua sử dụng</span>
          {unavailable && (
            <span className="rounded-full bg-rose-600 px-2 py-1 text-[10px] font-semibold text-white">
              {product.isDone ? 'Đã bán' : 'Tạm ngưng'}
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <p className="mb-1 line-clamp-1 text-[10px] font-semibold uppercase tracking-wide text-primary/80">{product.category}</p>
        <Link href={productHref} className="min-h-[42px] text-sm font-semibold leading-5 text-slate-900 transition-colors hover:text-primary sm:text-[15px]">
          {product.name}
        </Link>

        {product.description?.trim() && (
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{product.description}</p>
        )}

        <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-base font-bold text-rose-600 sm:text-lg">{priceLabel}</span>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-1.5 border-t border-slate-100 pt-3 text-[11px] leading-4 text-slate-600">
          <span className="flex items-start gap-1.5"><FaShieldAlt className="mt-0.5 shrink-0 text-emerald-600" />Bảo hành 6 tháng</span>
          <span className="flex items-start gap-1.5"><FaCheckCircle className="mt-0.5 shrink-0 text-blue-600" />Màn hình và main: 3 tháng</span>
          <span className="flex items-start gap-1.5"><FaExchangeAlt className="mt-0.5 shrink-0 text-rose-600" />Bao test 7 ngày, 1 đổi 1</span>
        </div>

        <Link
          href={productHref}
          className={`mt-4 inline-flex min-h-10 items-center justify-center rounded-lg px-3 text-sm font-semibold transition-colors ${unavailable ? 'pointer-events-none bg-slate-100 text-slate-400' : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'
            }`}
          aria-disabled={unavailable}
          tabIndex={unavailable ? -1 : undefined}
        >
          {unavailable ? 'Sản phẩm không còn' : 'Xem chi tiết'}
        </Link>
      </div>
    </article>
  );
}

function ProductGrid({ products, parentCategorySlug }: { products: UsedProduct[]; parentCategorySlug: string }) {
  if (products.length === 0) {
    return (
      <div className="col-span-full flex flex-col items-center rounded-xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center">
        <FaBoxOpen className="mb-3 text-4xl text-slate-300" aria-hidden="true" />
        <h3 className="text-base font-semibold text-slate-800">Chưa có sản phẩm trong danh mục này</h3>
        <p className="mt-1 max-w-md text-sm text-slate-500">Danh mục sẽ tự hiển thị sản phẩm khi dữ liệu được cập nhật trên hệ thống.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => <ProductCard key={product._id} product={product} parentCategorySlug={parentCategorySlug} />)}
    </div>
  );
}

export default function UsedProductCatalogClient({
  parentCategorySlug,
  parentCategoryName,
  allProducts,
  visibleProducts,
  categories,
  selectedCategorySlug,
}: UsedProductCatalogClientProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 24;
  const selectedCategory = categories.find((category) => category.slug === selectedCategorySlug);
  const selectedTitle = selectedCategory?.name ?? parentCategoryName;

  useEffect(() => setCurrentPage(1), [selectedCategorySlug, visibleProducts.length]);

  const totalPages = Math.max(1, Math.ceil(visibleProducts.length / pageSize));
  const currentProducts = useMemo(
    () => visibleProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [visibleProducts, currentPage],
  );

  const baseHref = `/san-pham-cu/${encodeURIComponent(parentCategorySlug)}`;

  return (
    <main className="min-h-screen bg-slate-50 pb-12">
      <div className="mx-auto w-full max-w-[1440px] px-3 sm:px-5 lg:px-8">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 py-4 text-xs text-slate-500 sm:text-sm">
          <Link href="/" className="hover:text-primary">Trang chủ</Link>
          <span aria-hidden="true">/</span>
          <span className="text-slate-500">Sản phẩm cũ</span>
          <span aria-hidden="true">/</span>
          <span className="font-medium text-slate-800">{parentCategoryName}</span>
          {selectedCategory && <><span aria-hidden="true">/</span><span className="font-medium text-slate-800">{selectedCategory.name}</span></>}
        </nav>

        <header className="overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-5 py-7 text-white sm:px-8 sm:py-9">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">7teck · Laptop đã qua sử dụng</p>
          <div className="mt-3 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">Laptop {selectedTitle} đã qua sử dụng</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75 sm:text-base">
                Chọn nhanh theo dòng máy, xem giá và tình trạng sản phẩm trong một trang.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs sm:min-w-[310px]">
              <div className="rounded-xl border border-white/15 bg-white/5 p-3">
                <p className="text-white/60">Danh mục con</p>
                <p className="mt-1 text-xl font-bold">{categories.length}</p>
              </div>
              <div className="rounded-xl border border-white/15 bg-white/5 p-3">
                <p className="text-white/60">Sản phẩm</p>
                <p className="mt-1 text-xl font-bold">{selectedCategorySlug ? visibleProducts.length : allProducts.length}</p>
              </div>
            </div>
          </div>
        </header>

        <section aria-label="Chính sách sản phẩm cũ" className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-white p-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700"><FaShieldAlt /></span>
            <div><p className="text-sm font-bold text-slate-900">Bảo hành 6 tháng</p><p className="mt-0.5 text-xs text-slate-500">Màn hình và main: 3 tháng</p></div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-white p-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700"><FaCheckCircle /></span>
            <div><p className="text-sm font-bold text-slate-900">Bao test 7 ngày</p><p className="mt-0.5 text-xs text-slate-500">Kiểm tra kỹ trước khi quyết định</p></div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-rose-100 bg-white p-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-700"><FaExchangeAlt /></span>
            <div><p className="text-sm font-bold text-slate-900">1 đổi 1</p><p className="mt-0.5 text-xs text-slate-500">Theo chính sách bao test 7 ngày</p></div>
          </div>
        </section>

        <section className="mt-6">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 sm:text-lg">Danh mục {parentCategoryName}</h2>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">Danh sách danh mục được tạo tự động từ dữ liệu sản phẩm.</p>
            </div>
            {selectedCategorySlug && <Link href={baseHref} className="shrink-0 text-xs font-semibold text-primary hover:underline sm:text-sm">Xem tất cả dòng máy</Link>}
          </div>
          <div className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
            <Link
              href={baseHref}
              aria-current={!selectedCategorySlug ? 'page' : undefined}
              className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition-colors sm:text-sm ${!selectedCategorySlug ? 'border-primary bg-primary text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-primary/50 hover:text-primary'}`}
            >Tất cả ({allProducts.length})</Link>
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`${baseHref}/${encodeURIComponent(category.slug)}`}
                aria-current={selectedCategorySlug === category.slug ? 'page' : undefined}
                className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition-colors sm:text-sm ${selectedCategorySlug === category.slug ? 'border-primary bg-primary text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-primary/50 hover:text-primary'}`}
              >{category.name} <span className="ml-1 opacity-70">({category.count})</span></Link>
            ))}
          </div>
        </section>

        {selectedCategorySlug ? (
          <section className="mt-6">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">{selectedTitle}</h2>
                <p className="mt-1 text-sm text-slate-500">{visibleProducts.length} sản phẩm trong danh mục</p>
              </div>
            </div>
            <ProductGrid products={currentProducts} parentCategorySlug={parentCategorySlug} />
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-3">
                <button type="button" disabled={currentPage <= 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40">Trước</button>
                <span className="text-sm text-slate-500">Trang {currentPage}/{totalPages}</span>
                <button type="button" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40">Tiếp</button>
              </div>
            )}
          </section>
        ) : (
          <div className="mt-7 space-y-9">
            {categories.map((category) => (
              <section key={category.slug}>
                <div className="mb-4 flex items-end justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 sm:text-xl">{category.name}</h2>
                    <p className="mt-1 text-xs text-slate-500 sm:text-sm">{category.count} sản phẩm</p>
                  </div>
                  <Link href={`${baseHref}/${encodeURIComponent(category.slug)}`} className="shrink-0 rounded-lg border border-primary/20 bg-white px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-white sm:text-sm">Xem tất cả <span aria-hidden="true">→</span></Link>
                </div>
                <ProductGrid products={category.products.slice(0, 8)} parentCategorySlug={parentCategorySlug} />
              </section>
            ))}
            {categories.length === 0 && <ProductGrid products={allProducts} parentCategorySlug={parentCategorySlug} />}
          </div>
        )}
      </div>
    </main>
  );
}
