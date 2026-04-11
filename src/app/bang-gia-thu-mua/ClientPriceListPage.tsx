'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPhoneCall, FiZap, FiShield, FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import HeaderResponsive from '@/components/userPage/ui/HeaderResponsive';
import { LoadingLocal } from '@/components/orther/loading';
import { formatCurrency } from '@/utils/formatCurrency';
import { scrollToTopInstantly } from '@/utils/scrollToTop';
import { IPriceListApi, IProductVariant } from '@/types/type/price-list/price-list';
import { hotlineUrl } from '@/utils/socialLinks';

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
    if (priceLists) setLoading(false);

    const aggregated: Record<string, CatalogsType> = {};
    const conditions: Record<string, string> = {};

    priceLists.forEach((list) => {
      if (!aggregated[list.category]) aggregated[list.category] = {};
      list.groups.forEach((group) => {
        if (list.conditions) conditions[group.catalog] = list.conditions;
        if (!aggregated[list.category][group.catalog]) aggregated[list.category][group.catalog] = [];
        aggregated[list.category][group.catalog].push(...group.variants);
      });
    });

    setCatalogs(aggregated);
    setConditionsMap(conditions);

    const defaultTabs: Record<string, string> = {};
    Object.entries(aggregated).forEach(([category, groupObj]) => {
      defaultTabs[category] = Object.keys(groupObj)[0] || '';
    });
    setActiveTabs(defaultTabs);
  }, [priceLists]);

  return (
    <div className="min-h-screen bg-[#f1f2f6] pb-20 font-sans">
      <HeaderResponsive Title_NavbarMobile="7teck.vn" />

      {/* 1. COMMERCIAL PROMOTIONAL BANNER */}
      <div className="relative overflow-hidden bg-neutral-900 pt-[60px] xl:pt-0">
        <div
          className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)', backgroundSize: '24px 24px' }}
        ></div>
        <div className="mx-auto max-w-[1400px] px-2 py-16">
          <div className="relative z-10 flex flex-col items-center text-center">
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mb-4 inline-block rounded-full bg-primary/20 px-2 py-1 text-xs font-bold uppercase tracking-[0.2em] text-primary outline outline-1 outline-primary/30"
            >
              Cập nhật hôm nay: {new Date().toLocaleDateString('vi-VN')}
            </motion.span>
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-4xl font-black tracking-tight text-white md:text-6xl"
            >
              THU CŨ ĐỔI MỚI <br /> <span className="text-primary underline decoration-white/20 underline-offset-8">GIÁ CAO NHẤT</span>
            </motion.h1>
            <p className="mt-6 max-w-2xl text-lg text-gray-400">
              7teck hỗ trợ thu mua mọi tình trạng máy. Thủ tục nhanh gọn trong 15 phút, thanh toán tiền mặt hoặc chuyển khoản ngay lập tức.
            </p>

            {/* Trust Badges */}
            <div className="mt-10 flex flex-wrap justify-center gap-6">
              {[
                { icon: <FiZap />, label: 'Thu nhanh 15p' },
                { icon: <FiShield />, label: 'Bảo mật dữ liệu' },
                { icon: <FiCheckCircle />, label: 'Báo giá chuẩn' },
              ].map((b, i) => (
                <div key={i} className="flex items-center gap-2 text-sm font-bold text-white/80">
                  <span className="text-primary">{b.icon}</span> {b.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. PRICE LIST SECTION */}
      <div className="mx-auto max-w-[1400px] px-2 py-12">
        {loading ? (
          <LoadingLocal />
        ) : (
          <div className="space-y-16">
            {Object.entries(catalogs).map(([categoryType, groupObj]) => {
              const label =
                categoryType === 'phoneProducts'
                  ? 'ĐIỆN THOẠI'
                  : categoryType === 'tabletProducts'
                    ? 'MÁY TÍNH BẢNG'
                    : categoryType === 'macbookProducts'
                      ? 'MACBOOK'
                      : 'LAPTOP WINDOWS';

              const tabs = Object.keys(groupObj);
              const active = activeTabs[categoryType];

              return (
                <section key={categoryType}>
                  {/* Category Title */}
                  <div className="mb-6 flex items-center gap-4">
                    <div className="h-1 w-12 bg-primary"></div>
                    <h2 className="text-2xl font-black uppercase italic tracking-tighter text-neutral-900">Bảng giá {label}</h2>
                  </div>

                  {/* TAB NAVIGATION - Mobile friendly slider */}
                  <div className="mb-4 flex flex-row xl:flex-wrap gap-2 overflow-x-auto pb-4 scrollbar-hide">
                    {tabs.map((catalog) => (
                      <button
                        key={catalog}
                        onClick={() => setActiveTabs({ ...activeTabs, [categoryType]: catalog })}
                        className={`relative min-w-fit rounded-lg border-2 px-6 py-3 text-xs font-black uppercase tracking-widest transition-all ${
                          active === catalog
                            ? 'border-primary bg-primary text-white shadow-lg shadow-primary/30'
                            : 'border-white bg-white text-gray-500 hover:border-primary/50'
                        }`}
                      >
                        {catalog}
                      </button>
                    ))}
                  </div>

                  {/* PRICE TABLE - Commercial Style */}
                  <div className="overflow-hidden rounded-xl border border-white bg-white shadow-xl shadow-neutral-900/5">
                    <AnimatePresence mode="wait">
                      <motion.div key={active} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-100 bg-neutral-50">
                              <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-widest text-gray-400">Tên sản phẩm</th>
                              <th className="px-6 py-4 text-center text-[11px] font-black uppercase tracking-widest text-primary">
                                Thu máy mới (100%)
                              </th>
                              <th className="px-6 py-4 text-center text-[11px] font-black uppercase tracking-widest text-gray-600">
                                Thu máy đẹp (99%)
                              </th>
                              <th className="px-6 py-4 text-center text-[11px] font-black uppercase tracking-widest text-gray-400">Thao tác</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {groupObj[active]?.map((product, index) => (
                              <tr key={index} className="group hover:bg-neutral-50/50">
                                <td className="px-6 py-4">
                                  <span className="block text-sm font-bold text-neutral-900">{product.name}</span>
                                  <span className="text-[10px] font-bold uppercase text-gray-400">{product.storage || 'Standard'}</span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  {product.price_new ? (
                                    <div className="flex flex-col items-center">
                                      <span className="font-mono text-base font-black text-emerald-600">{formatCurrency(product.price_new)}</span>
                                      <span className="text-[9px] font-bold uppercase tracking-tighter text-emerald-500/70">Giá thu đỉnh</span>
                                    </div>
                                  ) : (
                                    <span className="text-gray-300">—</span>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-center">
                                  {product.price_used ? (
                                    <span className="font-mono text-base font-black text-primary">{formatCurrency(product.price_used)}</span>
                                  ) : (
                                    <span className="text-gray-300">—</span>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <Link
                                    href="/lien-he"
                                    className="items-center gap-2 inline-flex whitespace-nowrap rounded-full bg-neutral-900 px-2 py-2 text-[10px] font-bold uppercase tracking-widest text-white transition-all hover:bg-primary hover:shadow-lg"
                                  >
                                    Đổi máy <FiArrowRight />
                                  </Link>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* PROMOTIONAL NOTE CARD */}
                  <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-xl bg-primary p-4 text-white md:flex-row">
                    <div className="flex items-center gap-3">
                      <FiPhoneCall className="animate-bounce" />
                      <span className="text-sm font-bold uppercase tracking-wider">
                        Bảng giá trên chỉ là tham khảo? Liên hệ ngay để nhận giá chính xác 100%
                      </span>
                    </div>
                    <Link
                      href={hotlineUrl}
                      className="rounded-lg bg-white px-6 py-2 text-xs font-black uppercase text-primary shadow-lg transition-transform active:scale-95"
                    >
                      Gọi tư vấn ngay
                    </Link>
                  </div>
                  {/* CONDITIONS */}
                  {conditionsMap[active] ? (
                    <div
                      className="prose mt-5 max-w-full break-words text-start text-base leading-[2.2rem] [&_h3>span]:rounded [&_h3>span]:bg-primary [&_h3>span]:p-1 [&_h3>span]:text-xl [&_h3>span]:font-semibold [&_h3>span]:text-white [&_h3>span]:backdrop-blur-sm [&_li>span]:rounded [&_li>span]:bg-white/50 [&_li>span]:p-1 [&_li>span]:text-default [&_li>span]:backdrop-blur-sm [&_p>span]:rounded [&_p>span]:bg-white/50 [&_p>span]:p-1 [&_p>span]:backdrop-blur-sm"
                      dangerouslySetInnerHTML={{
                        __html: conditionsMap[active]
                          .replace(/<li>(.*?)<\/li>/g, '<li><span>$1</span></li>')
                          .replace(/<p>(.*?)<\/p>/g, '<p><span>$1</span></p>')
                          .replace(/<h3>(.*?)<\/h3>/g, '<h3><span>$1</span></h3>'),
                      }}
                    />
                  ) : (
                    <div className="boder-white mt-5 border bg-white p-3 text-primary">
                      Không có điều kiện thu mua cho danh mục này. Liên hệ với chúng tôi để biết thêm thông tin.
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. STICKY MOBILE CTA */}
      <div className="fixed bottom-4 left-4 right-4 z-50 sm:hidden">
        <button className="flex w-full items-center justify-center gap-3 rounded-2xl bg-neutral-900 py-4 text-sm font-black uppercase tracking-[0.2em] text-white shadow-2xl">
          <FiPhoneCall /> ĐẶT LỊCH THU MUA NGAY
        </button>
      </div>
    </div>
  );
}
