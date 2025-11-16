'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, Table } from 'react-daisyui';
import HeaderResponsive from '@/components/userPage/ui/HeaderResponsive';
import { LoadingLocal } from '@/components/orther/loading';
import { formatCurrency } from '@/utils/formatCurrency';
import { scrollToTopInstantly } from '@/utils/scrollToTop';
import { IPriceListApi, IProductVariant } from '@/types/type/price-list/price-list';

interface CatalogsType {
  [catalog: string]: IProductVariant[];
}

export default function ClientPriceListPage({ priceLists }: { priceLists: IPriceListApi[] }) {
  const [loading, setLoading] = useState(true);
  const [catalogs, setCatalogs] = useState<Record<string, CatalogsType>>({});
  const [activeTabs, setActiveTabs] = useState<Record<string, string>>({});
  const [conditionsMap, setConditionsMap] = useState<Record<string, string>>({});

  useEffect(() => {
    scrollToTopInstantly();
    if (priceLists.length >= 0) setLoading(false);

    const aggregated: Record<string, CatalogsType> = {};
    const conditions: Record<string, string> = {};

    priceLists.forEach((list) => {
      if (!aggregated[list.category]) aggregated[list.category] = {};

      list.groups.forEach((group) => {
        // Map conditions to the catalog
        if (list.conditions) conditions[group.catalog] = list.conditions;

        if (!aggregated[list.category][group.catalog]) aggregated[list.category][group.catalog] = [];
        aggregated[list.category][group.catalog].push(
          ...group.variants.map((v) => ({
            ...v,
            price_new: v.price_new, // Now number | null
            price_used: v.price_used, // Now number | null
            storage: v.storage,
            condition: v.condition,
          }))
        );
      });
    });

    setCatalogs(aggregated);
    setConditionsMap(conditions);

    // Set default active tabs
    const defaultTabs: Record<string, string> = {};
    Object.entries(aggregated).forEach(([category, groupObj]) => {
      defaultTabs[category] = Object.keys(groupObj)[0] || '';
    });
    setActiveTabs(defaultTabs);
  }, [priceLists]);

  return (
    <div>
      <HeaderResponsive Title_NavbarMobile="7teck.vn" />
      <div className="py-[60px] xl:pt-0">
        <div className="breadcrumbs px-[10px] py-2 text-sm text-black shadow xl:px-desktop-padding">
          <ul className="font-light">
            <li>
              <Link role="navigation" aria-label="Trang chủ" href="/">
                Trang Chủ
              </Link>
            </li>
            <li>
              <Link role="navigation" aria-label="Bảng Giá Thu Mua" href="">
                Bảng Giá Thu Mua
              </Link>
            </li>
          </ul>
        </div>
        {/*  */}
        <div className="w-full rounded-md bg-gradient-to-r from-primary/10 via-transparent to-secondary/5 p-3">
          <div className="mx-auto max-w-6xl text-center">
            <p className="mx-auto max-w-2xl text-sm leading-6 text-gray-700">
              <span className="block text-xs text-gray-500">Thông tin giá thu mua thiết bị theo từng danh mục</span>
              <span className="text-base font-semibold text-primary xl:text-lg">Cập nhật nhanh – Minh bạch – Hỗ trợ kiểm tra & tư vấn.</span>
            </p>
          </div>
        </div>

        {/*  */}
        {loading ? (
          <LoadingLocal />
        ) : Object.keys(catalogs).length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-secondary bg-white p-6 text-center shadow-sm">
            <span className="text-xl font-semibold text-primary">Bảng Giá Thu Mua đang được cập nhật</span>
            <p className="text-sm text-gray-500">Vui lòng quay lại sau để xem thông tin mới nhất.</p>
          </div>
        ) : (
          <div className="px-2 xl:px-desktop-padding">
            {Object.entries(catalogs).map(([categoryType, groupObj]) => {
              const label =
                categoryType === 'phoneProducts'
                  ? 'Bảng Giá Thu Mua Điện Thoại'
                  : categoryType === 'tabletProducts'
                    ? 'Bảng Giá Thu Mua Máy tính bảng'
                    : categoryType === 'macbookProducts'
                      ? 'Bảng Giá Thu Mua Laptop Macbook'
                      : 'Bảng Giá Thu Mua Laptop Windows';
              
              return (
                <section key={categoryType} className="">
                  <header role="region" aria-label={label}>
                    <h2 className="my-3 text-2xl font-extrabold leading-tight text-primary">
                      <span className="block">{label}</span>
                    </h2>
                  </header>

                  {/* giữ nguyên toàn bộ phần tab + table */}
                  <div className="my-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
                    {Object.keys(groupObj).map((catalog) => (
                      <Button
                        key={catalog}
                        onClick={() => setActiveTabs({ ...activeTabs, [categoryType]: catalog })}
                        className={`flex transform items-center justify-center rounded-lg text-sm font-medium shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-md ${
                          activeTabs[categoryType] === catalog
                            ? 'bg-primary text-white shadow-lg hover:bg-primary-lighter hover:text-primary'
                            : 'border border-gray-200 bg-white text-primary hover:bg-primary-lighter'
                        }`}
                      >
                        {catalog}
                      </Button>
                    ))}
                  </div>

                  <div className="mt-5 w-full overflow-x-auto border border-primary scrollbar-hide">
                    <Table className="w-full" zebra>
                      <Table.Head className="bg-primary-lighter text-center text-primary">
                        <span>Tên sản phẩm</span>
                        <span>Giá máy mới</span>
                        <span>Giá máy 99%</span>
                      </Table.Head>
                      <Table.Body className="text-center text-sm">
                        {groupObj[activeTabs[categoryType]]?.map((product, index) => (
                          <Table.Row key={index}>
                            <span>{product.name}</span>
                            <span>{product.price_new !== null ? formatCurrency(product.price_new) : 'Liên Hệ'}</span>
                            <span>{product.price_used !== null ? formatCurrency(product.price_used) : 'Liên Hệ'}</span>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table>
                  </div>

                  {/* Display conditions for the selected catalog */}
                  {conditionsMap[activeTabs[categoryType]] ? (
                    <div
                      className="prose my-5 max-w-full"
                      aria-label={`Điều kiện thu mua cho ${activeTabs[categoryType]}`}
                      dangerouslySetInnerHTML={{ __html: conditionsMap[activeTabs[categoryType]] }}
                    />
                  ) : (
                    <div className="my-5 text-gray-500">Không có điều kiện thu mua cho danh mục này.</div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
