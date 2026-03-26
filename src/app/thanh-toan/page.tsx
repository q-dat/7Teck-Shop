'use client';
import React, { useEffect, useRef, useState } from 'react';
import HeaderResponsive from '../../components/userPage/ui/HeaderResponsive';
import { Textarea, Button } from 'react-daisyui';
import { scrollToTopInstantly } from '../../utils/scrollToTop';
import { Toastify } from '@/helper/Toastify';
import Link from 'next/link';
import InputForm from '@/components/userPage/InputForm';
import LabelForm from '@/components/userPage/LabelForm';
import Image from 'next/image';
import imageRepresent from '../../../public/image-represent';
import { messengerUrl, zaloUrl } from '@/utils/socialLinks';
import Zoom from '@/lib/Zoom';
import { formatCurrency } from '@/utils/formatCurrency';

interface ProductData {
  _id: string;
  name: string;
  slug: string;
  img: string;
  price: number;
  ram: string;
  color: string;
  link: string;
}

type TransactionMode = 'order' | 'schedule';
type ScheduleType = 'store' | 'home';

export default function PurchasePage() {
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(null);
  const [result, setResult] = React.useState<string>('');
  const formRef = useRef<HTMLFormElement>(null);
  const fallbackSrc = `${imageRepresent.Fallback}`;

  const [imgZaloQRSrc, setImgZaloQRSrc] = useState(`${imageRepresent.ZaloQR}`);
  const [imgMessageQRSrc, setImgMessageQRSrc] = useState(`${imageRepresent.Message}`);
  const [activeTab, setActiveTab] = useState<'zalo' | 'messenger'>('zalo');

  // State cho luồng nghiệp vụ mới
  const [transactionMode, setTransactionMode] = useState<TransactionMode>('order');
  const [scheduleType, setScheduleType] = useState<ScheduleType>('store');

  useEffect(() => {
    scrollToTopInstantly();
    const product = localStorage.getItem('selectedProduct');
    if (product) {
      setSelectedProduct(JSON.parse(product));
    }
  }, []);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setResult('Hệ thống đang xử lý...');

    const form = event.currentTarget;
    const formData = new FormData(form);

    const phone = formData.get('Số điện thoại:') as string;
    const name = formData.get('Tên khách hàng:') as string;

    // 1. Kiểm tra tính toàn vẹn dữ liệu
    if (!phone?.trim() || !name?.trim()) {
      Toastify('Yêu cầu điền đầy đủ thông tin định danh.', 400);
      setResult('');
      return;
    }

    const phoneRegex = /^(0\d{9,10})$/;
    if (!phoneRegex.test(phone)) {
      Toastify('Định dạng số điện thoại không hợp lệ.', 400);
      setResult('');
      return;
    }

    formData.append('access_key', process.env.NEXT_PUBLIC_WEB3FORMS_KEY!);

    // 2. Chuyển đổi cấu trúc dữ liệu sang Object để parse thành JSON (Đảm bảo chuẩn UTF-8)
    const objectData = Object.fromEntries(formData.entries());
    const payload = JSON.stringify(objectData);

    // 3. Thực thi gọi API với Header định dạng JSON
    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: payload,
      });

      const data: { success: boolean; message: string } = await response.json();

      if (data.success) {
        setResult('');
        Toastify('Xác nhận thành công. Chuyên viên sẽ liên hệ trong 15 phút.', 200);
        form.reset();
      } else {
        setResult(data.message);
      }
    } catch (error) {
      setResult('Gián đoạn kết nối máy chủ. Vui lòng thử lại.');
    }
  };

  // --- UI Components Phụ Trợ ---
  const ProductCard = ({ product }: { product: ProductData }) => (
    <div className="flex gap-4">
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
        <Zoom>
          <Image src={product.img} alt={product.name} fill className="object-contain" />
        </Zoom>
      </div>
      <div className="flex flex-col justify-center">
        <h3 className="font-bold leading-tight text-neutral-900">{product.name}</h3>
        <p className="mt-1 text-xs uppercase tracking-wider text-neutral-500">
          {product.color} | {product.ram}
        </p>
        <span className="mt-1 text-lg font-black text-neutral-900">{formatCurrency(product.price)}</span>
        <Link target="_blank" href={`${product.slug}`} className="text-xs font-light text-blue-700 underline">
          Chi tiết sản phẩm
        </Link>
      </div>
    </div>
  );

  const TrustFeature = ({ title, desc }: { title: string; desc: string }) => (
    <div className="flex flex-col border-l-2 border-neutral-800 pl-3">
      <span className="text-sm font-bold text-neutral-900">{title}</span>
      <span className="mt-0.5 text-xs text-neutral-500">{desc}</span>
    </div>
  );

  return (
    <div className="bg-neutral-50 py-[60px] text-neutral-900 selection:bg-neutral-900 selection:text-white xl:pt-0">
      <HeaderResponsive Title_NavbarMobile="Thanh toán" />
      <div className="breadcrumbs border-b border-gray-100 px-[10px] py-2 text-sm text-gray-500 xl:px-desktop-padding">
        <ul className="font-medium">
          <li>
            <Link aria-label="Trang chủ" href="/" className="transition-colors hover:text-black">
              Trang Chủ
            </Link>
          </li>
          <li>
            <span className="font-semibold text-black">Giao dịch</span>
          </li>
        </ul>
      </div>

      <main className="px-2 py-5 xl:px-desktop-padding">
        <header className="mb-8 border-b border-neutral-200">
          <h1 className="text-3xl font-black uppercase tracking-tighter text-neutral-900 xl:text-4xl">Thông tin giao dịch</h1>
          <p className="mt-2 text-sm text-neutral-500 xl:text-base">
            Giao dịch được mã hóa an toàn. Vui lòng cung cấp thông tin chính xác để đảm bảo tiến độ phục vụ.
          </p>
        </header>

        <div className="flex flex-col gap-5 xl:flex-row xl:items-start">
          {/* CỘT TRÁI: FORM & CAM KẾT */}
          <div className="flex w-full flex-col gap-6 xl:w-7/12">
            <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
              {/* TAB CHUYỂN ĐỔI LUỒNG NGHIỆP VỤ */}
              <div className="mb-6 flex gap-2 rounded-lg bg-neutral-100 p-1">
                <button
                  type="button"
                  onClick={() => setTransactionMode('order')}
                  className={`flex-1 rounded-md py-2.5 text-sm font-bold uppercase tracking-wider transition-all ${
                    transactionMode === 'order' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  Giao hàng tận nơi
                </button>
                <button
                  type="button"
                  onClick={() => setTransactionMode('schedule')}
                  className={`flex-1 rounded-md py-2.5 text-sm font-bold uppercase tracking-wider transition-all ${
                    transactionMode === 'schedule' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  Đặt lịch xem máy
                </button>
              </div>

              <div className="mb-4">
                <h2 className="text-lg font-bold uppercase tracking-wide text-neutral-900">1. Thông tin liên hệ</h2>
              </div>

              <form ref={formRef} onSubmit={onSubmit} className="space-y-6">
                {/* Ẩn input để Web3Forms nhận diện loại yêu cầu */}
                <input
                  type="hidden"
                  name="Loại dịch vụ:"
                  value={
                    transactionMode === 'order'
                      ? 'Mua hàng giao tận nơi'
                      : `Đặt lịch xem máy (${scheduleType === 'store' ? 'Tại cửa hàng' : 'Tại nhà'})`
                  }
                />

                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                  <InputForm
                    name="Tên khách hàng:"
                    type="text"
                    className="border border-gray-300 bg-white text-sm text-black focus:border-black"
                    placeholder="Nhập tên của bạn"
                    classNameLabel="bg-white peer-placeholder-shown:text-gray-500 peer-focus:text-black text-sm"
                  />
                  <InputForm
                    name="Số điện thoại:"
                    type="number"
                    placeholder="Nhập số điện thoại/Zalo"
                    className="border border-gray-300 bg-white text-sm text-black focus:border-black"
                    classNameLabel="bg-white peer-placeholder-shown:text-gray-500 peer-focus:text-black text-sm"
                  />
                </div>

                {/* Luồng: Giao hàng tận nơi */}
                {transactionMode === 'order' && (
                  <InputForm
                    name="Địa chỉ:"
                    type="text"
                    placeholder="Nhập địa chỉ nhận hàng"
                    className="border border-gray-300 bg-white text-sm text-black focus:border-black"
                    classNameLabel="bg-white peer-placeholder-shown:text-gray-500 peer-focus:text-black text-sm"
                  />
                )}

                {/* Luồng: Đặt lịch xem máy */}
                {transactionMode === 'schedule' && (
                  <div className="space-y-6 rounded-xl border border-neutral-100 bg-neutral-50 p-2">
                    <div className="flex flex-col gap-3 xl:flex-row xl:gap-6">
                      <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-neutral-900">
                        <input
                          type="radio"
                          name="Địa điểm xem máy (Phân loại):"
                          value="Tại cửa hàng"
                          checked={scheduleType === 'store'}
                          onChange={() => setScheduleType('store')}
                          className="radio-primary radio h-5 w-5 border-neutral-300"
                        />
                        Đến cửa hàng xem máy
                      </label>
                      <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-neutral-900">
                        <input
                          type="radio"
                          name="Địa điểm xem máy (Phân loại):"
                          value="Yêu cầu mang đến nhà"
                          checked={scheduleType === 'home'}
                          onChange={() => setScheduleType('home')}
                          className="radio-primary radio h-5 w-5 border-neutral-300"
                        />
                        Yêu cầu mang máy đến nhà
                      </label>
                    </div>

                    {scheduleType === 'home' && (
                      <InputForm
                        name="Địa chỉ nhà:"
                        type="text"
                        placeholder="Nhập địa chỉ bạn muốn nhân viên mang máy đến"
                        className="border border-gray-300 bg-white text-sm text-black focus:border-black"
                        classNameLabel="bg-neutral-50 peer-placeholder-shown:text-gray-500 peer-focus:text-black text-sm"
                      />
                    )}

                    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                      <InputForm
                        name="Ngày hẹn:"
                        placeholder="Ngày hẹn:"
                        type="date"
                        className="border border-gray-300 bg-white text-sm text-black focus:border-black"
                        classNameLabel="bg-neutral-50 peer-placeholder-shown:text-gray-500 peer-focus:text-black text-sm"
                      />
                      <InputForm
                        name="Giờ hẹn:"
                        placeholder="Giờ hẹn:"
                        type="time"
                        className="border border-gray-300 bg-white text-sm text-black focus:border-black"
                        classNameLabel="bg-neutral-50 peer-placeholder-shown:text-gray-500 peer-focus:text-black text-sm"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <LabelForm title="Ghi chú thêm (Tùy chọn):" />
                  <Textarea
                    name="Lời nhắn:"
                    className="min-h-[100px] w-full rounded-lg border-neutral-300 bg-neutral-50 p-3 text-sm transition-colors focus:border-neutral-900 focus:bg-white focus:outline-none"
                    placeholder="Yêu cầu riêng về thời gian, màu sắc hoặc cách thức hỗ trợ..."
                  />
                </div>

                {selectedProduct && (
                  <div className="hidden">
                    <input type="hidden" name="Sản phẩm" value={`${selectedProduct.name} (${selectedProduct.color})`} />
                    <input type="hidden" name="Link" value={`${window.location.origin}${selectedProduct.link}`} />
                  </div>
                )}

                <div className="pt-6">
                  {result && <p className="mb-3 text-sm font-semibold text-neutral-600">{result}</p>}
                  <Button
                    type="submit"
                    className="h-14 w-full rounded-xl border-none bg-neutral-900 text-base font-bold text-white transition-all hover:bg-neutral-800"
                  >
                    {transactionMode === 'order' ? 'HOÀN TẤT ĐẶT HÀNG' : 'XÁC NHẬN ĐẶT LỊCH'}
                  </Button>
                  <p className="mt-3 text-center text-[11px] font-medium uppercase tracking-widest text-neutral-400">
                    Thông tin được bảo mật tuyệt đối theo tiêu chuẩn SSL
                  </p>
                </div>
              </form>
            </section>

            {/* Yếu tố Uy tín (Trust Badges) */}
            <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
              <TrustFeature title="Chính hãng 100%" desc="Đầy đủ chứng từ nguồn gốc" />
              <TrustFeature title="Bảo hành tiêu chuẩn" desc="Hỗ trợ kỹ thuật trọn đời máy" />
              <TrustFeature title="Kiểm tra khi nhận" desc="Đồng kiểm trước khi thanh toán" />
            </section>
          </div>

          {/* CỘT PHẢI: SUMMARY & LIÊN HỆ NHANH */}
          <aside className="flex w-full flex-col gap-6 xl:sticky xl:top-8 xl:w-5/12">
            {/* Tóm tắt đơn hàng */}
            <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-end justify-between border-b border-neutral-100 pb-4">
                <h2 className="text-lg font-bold uppercase tracking-wide text-neutral-900">2. Chi tiết cấu hình</h2>
                <Link
                  href="/"
                  className="text-xs font-semibold text-neutral-500 underline underline-offset-2 transition-colors hover:text-neutral-900"
                >
                  Sửa đổi
                </Link>
              </div>

              {selectedProduct ? (
                <div className="flex flex-col gap-6">
                  <ProductCard product={selectedProduct} />
                  <div className="flex items-center justify-between border-t border-neutral-100 pt-4">
                    <span className="text-sm font-medium text-neutral-500">{transactionMode === 'order' ? 'Tổng thanh toán' : 'Giá dự kiến'}</span>
                    <span className="text-xl font-black text-price">{formatCurrency(selectedProduct.price)}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-neutral-400">Chưa có dữ liệu sản phẩm.</p>
              )}
            </section>

            {/* Hỗ trợ trực tuyến */}
            <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="mb-2">
                <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-900">Kênh hỗ trợ khẩn cấp</h2>
                <p className="mt-1 text-xs text-neutral-500">Quét mã QR để gặp trực tiếp chuyên viên tư vấn</p>
              </div>

              <div className="mb-2 flex gap-2 rounded-lg bg-neutral-100 p-1">
                {(['zalo', 'messenger'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 rounded-md py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                      activeTab === tab ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="flex flex-col items-center">
                <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-2">
                  <Zoom>
                    <Image
                      src={activeTab === 'zalo' ? imgZaloQRSrc : imgMessageQRSrc}
                      alt={`Mã QR ${activeTab}`}
                      width={160}
                      height={160}
                      className="rounded-lg object-contain mix-blend-multiply"
                      onError={() => (activeTab === 'zalo' ? setImgZaloQRSrc(fallbackSrc) : setImgMessageQRSrc(fallbackSrc))}
                    />
                  </Zoom>
                </div>

                <Link
                  href={activeTab === 'zalo' ? zaloUrl : messengerUrl}
                  target="_blank"
                  className="mt-6 border-b border-neutral-900 pb-0.5 text-sm font-bold text-neutral-900 transition-colors hover:border-neutral-600 hover:text-neutral-600"
                >
                  Mở ứng dụng kết nối
                </Link>
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
