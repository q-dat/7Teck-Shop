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
      if (list.conditions) conditions[list.category] = list.conditions;

      list.groups.forEach((group) => {
        if (!aggregated[list.category][group.catalog]) aggregated[list.category][group.catalog] = [];
        aggregated[list.category][group.catalog].push(...group.variants);
      });
    });

    setCatalogs(aggregated);
    setConditionsMap(conditions);

    // set default active tabs
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
              <Link role="navigation" aria-label="Bảng giá thu mua" href="">
                Bảng Giá Thu Mua
              </Link>
            </li>
          </ul>
        </div>

        {loading ? (
          <LoadingLocal />
        ) : Object.keys(catalogs).length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-secondary bg-white p-6 text-center shadow-sm">
            <span className="text-xl font-semibold text-primary">Bảng giá thu mua đang được cập nhật</span>
            <p className="text-sm text-gray-500">Vui lòng quay lại sau để xem thông tin mới nhất.</p>
          </div>
        ) : (
          <div className="px-2 xl:px-desktop-padding">
            {Object.entries(catalogs).map(([categoryType, groupObj]) => (
              <div key={categoryType} className="mb-10">
                <div role="region" aria-label={`Danh mục ${categoryType}`}>
                  <h2 className="relative inline-block text-2xl font-extrabold text-primary">
                    <span className="after:mt-2 after:block after:h-1 after:w-full after:rounded-full after:bg-gradient-to-r after:from-purple-500 after:via-pink-500 after:to-red-500 after:content-['']">
                      {categoryType === 'phoneProducts'
                        ? 'Bảng giá Điện Thoại'
                        : categoryType === 'tabletProducts'
                          ? 'Bảng giá Máy tính bảng'
                          : categoryType === 'macbookProducts'
                            ? 'Bảng giá Laptop Macbook'
                            : 'Bảng giá Laptop Windows'}
                    </span>
                  </h2>
                </div>

                <div className="my-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
                  {Object.keys(groupObj).map((catalog) => (
                    <Button
                      key={catalog}
                      onClick={() => setActiveTabs({ ...activeTabs, [categoryType]: catalog })}
                      className={`flex transform items-center justify-center rounded-lg text-sm font-medium shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-md ${
                        activeTabs[categoryType] === catalog
                          ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white shadow-lg'
                          : 'border border-gray-200 bg-white text-primary hover:bg-primary-lighter'
                      } `}
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
                          {product.price_new ? <span>{formatCurrency(product.price_new)}</span> : <span>Liên Hệ</span>}
                          {product.price_used ? <span>{formatCurrency(product.price_used)}</span> : <span>Liên Hệ</span>}
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table>
                </div>

                {/* Hiển thị conditions HTML */}
                {conditionsMap[categoryType] && (
                  <div className="prose my-5 max-w-full" dangerouslySetInnerHTML={{ __html: conditionsMap[categoryType] }} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
