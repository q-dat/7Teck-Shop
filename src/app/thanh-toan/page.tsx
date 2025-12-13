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
  img: string;
  price: number;
  ram: string;
  color: string;
  link: string;
}

export default function PurchasePage() {
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(null);
  const [result, setResult] = React.useState<string>('');
  const formRef = useRef<HTMLFormElement>(null);
  const fallbackSrc = `${imageRepresent.Fallback}`;
  const mainZaloQRSrc = `${imageRepresent.ZaloQR}`;
  const mainMessageQRSrc = `${imageRepresent.Message}`;

  const [imgZaloQRSrc, setImgZaloQRSrc] = useState(mainZaloQRSrc);
  const [imgMessageQRSrc, setImgMessageQRSrc] = useState(mainMessageQRSrc);

  const [activeTab, setActiveTab] = useState<'zalo' | 'messenger'>('zalo');

  useEffect(() => {
    scrollToTopInstantly();

    const product = localStorage.getItem('selectedProduct');
    if (product) {
      setSelectedProduct(JSON.parse(product));
    }
  }, []);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setResult('Đang gửi...');
    const formData = new FormData(event.currentTarget);
    const phone = formData.get('Số điện thoại:') as string;

    if (!phone.trim()) {
      Toastify('Vui lòng nhập số điện thoại!', 400);
      setResult('');
      return;
    }
    const name = formData.get('Tên khách hàng:') as string;

    if (!name.trim()) {
      Toastify('Vui lòng nhập tên khách hàng!', 400);
      setResult('');
      return;
    }

    const phoneRegex = /^(0\d{9,10})$/;
    if (!phoneRegex.test(phone)) {
      Toastify('Số điện thoại không hợp lệ! Vui lòng nhập đúng định dạng.', 400);
      setResult('');
      return;
    }

    formData.append('access_key', process.env.NEXT_PUBLIC_WEB3FORMS_KEY!);

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      });

      const data: { success: boolean; message: string } = await response.json();

      if (data.success) {
        setResult('Đã gửi biểu mẫu thành công!');
        Toastify('Đã gửi biểu mẫu thành công!. Vui lòng đợi để được hỗ trợ!', 200);
        formRef.current?.reset();
      } else {
        console.error('Error', data);
        setResult(data.message);
      }
    } catch (error) {
      console.error('Yêu cầu thất bại', error);
      setResult('Đã xảy ra lỗi khi gửi biểu mẫu!');
    }
  };

  const productInfoStyle = 'text-sm text-gray-700';
  const productLabelStyle = 'font-bold text-gray-900 min-w-[50px] inline-block';
  const primaryColor = 'text-black border-black hover:bg-black hover:text-white';
  const secondaryColor = 'text-red-700 font-bold';

  return (
    <div>
      <HeaderResponsive Title_NavbarMobile="7teck.vn" />
      <div className="py-[60px] xl:pt-0">
        {/* --- Breadcrumbs: Minimalist Style --- */}
        <div className="breadcrumbs border-b border-gray-100 px-[10px] py-2 text-sm text-gray-500 xl:px-desktop-padding">
          <ul className="font-medium">
            <li>
              <Link aria-label="Trang chủ" href="/" className="transition-colors hover:text-black">
                Trang Chủ
              </Link>
            </li>
            <li>
              <span className="font-semibold text-black">Mua Hàng</span>
            </li>
          </ul>
        </div>

        {/* --- NEW SECTION: Hero/Intro Professional --- */}
        <section className="border-b border-gray-200 bg-white px-2 py-10 text-center xl:px-desktop-padding">
          <h1 className="text-3xl font-black uppercase tracking-tighter text-gray-900 xl:text-6xl">HOÀN TẤT ĐẶT HÀNG</h1>
          <p className="mx-auto mt-2 max-w-4xl text-sm text-gray-700 xl:text-lg">
            Vui lòng điền thông tin hoặc liên hệ trực tiếp qua Zalo/Messenger để chúng tôi xác nhận sản phẩm và tiến hành giao hàng nhanh chóng, an
            toàn.
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <div className="flex items-center gap-1 text-sm font-medium text-gray-800">
              {/* Icon Placeholder for Professional look */}
              <span className="text-lg font-extrabold leading-none text-black">&#x2713;</span> Xác nhận nhanh
            </div>
            <div className="flex items-center gap-1 text-sm font-medium text-gray-800">
              <span className="text-lg font-extrabold leading-none text-black">&#x2713;</span> Thanh toán linh hoạt
            </div>
            <div className="flex items-center gap-1 text-sm font-medium text-gray-800">
              <span className="text-lg font-extrabold leading-none text-black">&#x2713;</span> Hỗ trợ 24/7
            </div>
          </div>
        </section>

        {/* --- Contact Content --- */}
        <div className="px-2 xl:px-desktop-padding">
          <div className="mt-8 flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between xl:gap-8">
            {' '}
            {/* Giảm gap xuống 6/8 */}
            {/* --- Cột Trái: Form và Sản phẩm (Mobile) --- */}
            <div className="w-full xl:w-2/3">
              {/* List Product (Mobile View) */}
              {selectedProduct && (
                <div className="mb-5 block rounded-md border border-gray-200 p-3 xl:hidden">
                  {' '}
                  {/* Giảm p, mb */}
                  <h2 className="text-md mb-2 border-b border-gray-100 pb-2 font-bold text-gray-900">Sản phẩm bạn đã chọn:</h2> {/* Giảm text size */}
                  <div className="flex items-start gap-3">
                    {' '}
                    {/* Giảm gap */}
                    <Image
                      src={selectedProduct.img}
                      alt="Ảnh sản phẩm"
                      width={80}
                      height={80}
                      className="rounded-sm border border-gray-200 object-cover" // Giảm size ảnh, bo góc
                    />
                    <div className="flex flex-col gap-0.5">
                      {' '}
                      {/* Giảm gap */}
                      <p className="text-base font-bold text-gray-900">{selectedProduct.name}</p> {/* Giảm text size */}
                      <p className={productInfoStyle}>
                        <span className={productLabelStyle}>Màu:</span>
                        {selectedProduct.color}
                      </p>
                      <p className={productInfoStyle}>
                        <span className={productLabelStyle}>RAM:</span>
                        {selectedProduct.ram}
                      </p>
                      <p className={`${secondaryColor} text-lg`}>{formatCurrency(selectedProduct.price)}</p> {/* Giảm text size */}
                      <Link
                        href={selectedProduct.link}
                        className="text-xs text-black underline transition-colors hover:text-gray-700" // Giảm text size
                      >
                        Xem trang chi tiết
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Section */}
              <div className="w-full space-y-5">
                {' '}
                {/* Giảm space-y */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Cách 1: Điền thông tin liên hệ</h2> {/* Giảm text size */}
                  <p className="mt-1 text-sm text-gray-600">Điền biểu mẫu. Chúng tôi sẽ gọi lại trong vòng 10 phút để xác nhận đơn hàng.</p>
                </div>
                <form
                  ref={formRef}
                  onSubmit={onSubmit}
                  className="flex flex-col items-center justify-center rounded-lg border border-gray-200 p-4 xl:p-6" // Giảm p
                >
                  <div className="flex w-full flex-col gap-4" role="region" aria-label="Thông tin liên hệ">
                    {' '}
                    {/* Giảm gap */}
                    <div className="flex w-full flex-col gap-4 xl:flex-row">
                      {' '}
                      {/* Giảm gap */}
                      <div className="w-full" aria-label="Số điện thoại hoặc Zalo">
                        <InputForm
                          name="Số điện thoại:"
                          type="number"
                          placeholder="Nhập số điện thoại/Zalo"
                          className="border border-gray-300 bg-white text-sm text-black focus:border-black" // Giảm text size
                          classNameLabel="bg-white peer-placeholder-shown:text-gray-500 peer-focus:text-black text-sm" // Giảm text size
                        />
                      </div>
                      <div className="w-full" aria-label="Tên của bạn">
                        <InputForm
                          name="Tên khách hàng:"
                          type="text"
                          className="border border-gray-300 bg-white text-sm text-black focus:border-black" // Giảm text size
                          placeholder="Nhập tên của bạn"
                          classNameLabel="bg-white peer-placeholder-shown:text-gray-500 peer-focus:text-black text-sm" // Giảm text size
                        />
                      </div>
                    </div>
                    <div className="w-full" aria-label="Nhập địa chỉ của bạn">
                      <InputForm
                        name="Địa chỉ:"
                        type="text"
                        placeholder="Nhập địa chỉ nhận hàng"
                        className="border border-gray-300 bg-white text-sm text-black focus:border-black" // Giảm text size
                        classNameLabel="bg-white peer-placeholder-shown:text-gray-500 peer-focus:text-black text-sm" // Giảm text size
                      />
                    </div>
                    <div className="flex flex-col">
                      <LabelForm title={'Ghi chú/Yêu cầu thêm:'} />
                      <Textarea
                        name="Lời nhắn:"
                        className="min-h-[80px] border border-gray-300 bg-white px-2 py-2 text-black placeholder:text-xs placeholder:text-gray-500 focus:border-black focus:outline-none" // Giảm padding, min-height
                        placeholder="Yêu cầu về sản phẩm, thời gian nhận hàng, v.v..."
                      />
                    </div>
                    {selectedProduct && (
                      <div className="w-full rounded-md border border-gray-200 bg-gray-50 p-2">
                        {' '}
                        {/* Giảm padding */}
                        <label htmlFor="input_product_name" className="text-xs font-medium text-gray-600">
                          Sản phẩm đang đặt mua:
                        </label>{' '}
                        {/* Giảm text size */}
                        <Textarea
                          readOnly
                          className="mt-1 w-full border border-gray-300 bg-white p-2 text-sm font-semibold text-black focus:outline-none" // Giảm text size
                          id="input_product_name"
                          name="Tên sản phẩm (Thông tin đơn):"
                          value={`${selectedProduct.name} | Màu: ${selectedProduct.color} | RAM: ${selectedProduct.ram}`}
                        />
                        <input
                          readOnly
                          type="hidden"
                          name="Chi tiết sản phẩm:"
                          value={`Tên: ${selectedProduct.name}\nMàu: ${selectedProduct.color}\nRAM: ${selectedProduct.ram}\nGiá: ${formatCurrency(selectedProduct.price)}\nHình ảnh: ${selectedProduct.img}`}
                        />
                        <input readOnly type="hidden" name="Link sản phẩm:" value={`${window.location.origin}${selectedProduct.link}`} />
                      </div>
                    )}
                    <div className="w-full">
                      <p className="mb-2 min-h-[16px] text-xs font-medium text-red-600">{result}</p>
                      <Button
                        aria-label="Nút: Gửi yêu cầu đặt hàng"
                        className={`w-full border ${primaryColor} bg-black py-2.5 text-sm font-bold uppercase tracking-wider text-white transition-all duration-300`} // Giảm padding
                        type="submit"
                      >
                        Gửi Yêu Cầu Đặt Hàng
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
            {/* --- Cột Phải: Sản phẩm (Desktop) và Social --- */}
            <div className="flex w-full flex-col gap-6 xl:w-1/3">
              {/* List Product (Desktop View) */}
              {selectedProduct && (
                <div className="hidden rounded-lg border border-gray-200 p-3 xl:block">
                  {' '}
                  {/* Giảm padding */}
                  <h2 className="text-md mb-2 border-b border-gray-100 pb-2 font-bold text-gray-900">Sản phẩm bạn đã chọn:</h2> {/* Giảm text size */}
                  <div className="flex items-start gap-3">
                    {' '}
                    {/* Giảm gap */}
                    <Image
                      src={selectedProduct.img}
                      alt="Ảnh sản phẩm"
                      width={80}
                      height={80}
                      className="rounded-sm border border-gray-200 object-cover" // Giảm size ảnh, bo góc
                    />
                    <div className="flex flex-col gap-0.5">
                      {' '}
                      {/* Giảm gap */}
                      <p className="text-base font-bold text-gray-900">{selectedProduct.name}</p> {/* Giảm text size */}
                      <p className={productInfoStyle}>
                        <span className={productLabelStyle}>Màu:</span>
                        {selectedProduct.color}
                      </p>
                      <p className={productInfoStyle}>
                        <span className={productLabelStyle}>RAM:</span>
                        {selectedProduct.ram}
                      </p>
                      <p className={`${secondaryColor} text-lg`}>{formatCurrency(selectedProduct.price)}</p> {/* Giảm text size */}
                      <Link
                        href={selectedProduct.link}
                        className="text-xs text-black underline transition-colors hover:text-gray-700" // Giảm text size
                      >
                        Xem trang chi tiết
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* --- Social Section: Gộp thành Tabs --- */}
              <div className="w-full rounded-lg border border-gray-200 p-3">
                {' '}
                {/* Giảm padding */}
                <h2 className="mb-3 border-b border-gray-100 pb-2 text-xl font-bold text-gray-900">
                  {' '}
                  {/* Giảm text size */}
                  Cách 2 & 3: Liên hệ trực tiếp
                </h2>
                <div className="tabs-boxed tabs bg-white p-0 shadow-none">
                  {/* Tab Header Zalo */}
                  <button
                    role="tab"
                    aria-selected={activeTab === 'zalo'}
                    className={`tab-sm tab flex-1 text-sm font-semibold uppercase tracking-wider ${activeTab === 'zalo' ? 'tab-active border-b-2 border-black bg-white text-black' : 'bg-white text-gray-500 hover:text-black'}`} // Giảm size tab
                    onClick={() => setActiveTab('zalo')}
                  >
                    Zalo
                  </button>

                  {/* Tab Header Messenger */}
                  <button
                    role="tab"
                    aria-selected={activeTab === 'messenger'}
                    className={`tab-sm tab flex-1 text-sm font-semibold uppercase tracking-wider ${activeTab === 'messenger' ? 'tab-active border-b-2 border-black bg-white text-black' : 'bg-white text-gray-500 hover:text-black'}`} // Giảm size tab
                    onClick={() => setActiveTab('messenger')}
                  >
                    Messenger
                  </button>
                </div>
                {/* --- Tab Content Container --- */}
                <div className="pt-5">
                  {' '}
                  {/* Giảm padding top */}
                  {/* --- Tab Content Zalo --- */}
                  {activeTab === 'zalo' && (
                    <div className="flex w-full flex-col items-center justify-start gap-4">
                      <div className="w-full text-center">
                        <p className="mt-1 text-xs text-gray-600">Quét mã QR hoặc nhấn vào link để nhận hỗ trợ **Zalo** ngay lập tức.</p>
                        <Link
                          className="mt-2 block text-sm font-bold text-black underline transition-colors hover:text-gray-700"
                          href={zaloUrl}
                          target="_blank"
                        >
                          Nhắn tin Zalo ngay
                        </Link>
                      </div>
                      <Zoom>
                        <Image
                          src={imgZaloQRSrc}
                          alt="Mã QR Zalo"
                          width={200}
                          height={200}
                          className="h-[200px] w-[200px] rounded-md border border-gray-200 object-contain p-1" // Giảm size QR
                          onError={() => setImgZaloQRSrc(fallbackSrc)}
                        />
                      </Zoom>
                    </div>
                  )}
                  {/* --- Tab Content Messenger --- */}
                  {activeTab === 'messenger' && (
                    <div className="flex w-full flex-col items-center justify-start gap-4">
                      <div className="w-full text-center">
                        <p className="mt-1 text-xs text-gray-600">Quét mã QR hoặc nhấn vào link để liên hệ **Messenger** ngay lập tức.</p>
                        <Link
                          className="mt-2 block text-sm font-bold text-black underline transition-colors hover:text-gray-700"
                          href={messengerUrl}
                          target="_blank"
                        >
                          Nhắn tin Messenger ngay
                        </Link>
                      </div>
                      <Zoom>
                        <Image
                          src={imgMessageQRSrc}
                          alt="Mã QR Messenger"
                          width={200}
                          height={200}
                          className="h-[200px] w-[200px] rounded-md border border-gray-200 object-contain p-1" // Giảm size QR
                          onError={() => setImgMessageQRSrc(fallbackSrc)}
                        />
                      </Zoom>
                    </div>
                  )}
                </div>{' '}
                {/* End Tab Content Container */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
