'use client';
import HeaderResponsive from '@/components/userPage/ui/HeaderResponsive';
import { hotlineUrl, mailUrl, ggMapShareUrl, address, messengerUrl, zaloUrl, fanpageUrl, ggMapEmbedUrl } from '@/utils/socialLinks';
import Link from 'next/link';
import Image from 'next/image';
import { FaFacebook, FaFacebookMessenger } from 'react-icons/fa';
import { imagePages } from '../../../public/pages';
import { Toastify } from '@/helper/Toastify';
import { useRef, useState } from 'react';
import InputForm from '@/components/userPage/InputForm';
import { Button, Textarea } from 'react-daisyui';
import LabelForm from '@/components/userPage/LabelForm';

export default function ContactPage() {
  const [result, setResult] = useState<string>('');
  const formRef = useRef<HTMLFormElement>(null);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setResult('Đang gửi...');
    const formData = new FormData(event.currentTarget);
    const phone = formData.get('Số điện thoại:') as string;
    if (!phone.trim()) {
      Toastify('Vui lòng nhập số điện thoại!', 400);
      return;
    }
    const name = formData.get('Tên khách hàng:') as string;

    if (!name.trim()) {
      Toastify('Vui lòng nhập tên khách hàng!', 400);
      return;
    }
    //
    const phoneRegex = /^(0\d{9,10})$/;
    if (!phoneRegex.test(phone)) {
      Toastify('Số điện thoại không hợp lệ! Vui lòng nhập đúng định dạng.', 400);
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
        // Reset form using formRef
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
              <Link role="navigation" aria-label="Liên hệ" href="">
                Liên Hệ
              </Link>
            </li>
          </ul>
        </div>

        {/* Nội dung UI - Thêm sections và hình ảnh */}
        <div className="w-full px-2 py-6 xl:px-desktop-padding">
          {/* Section 1: Giới thiệu liên hệ */}
          <div className="rounded-2xl bg-white p-2 shadow-lg xl:p-6">
            <div className="grid gap-8 xl:grid-cols-2 xl:items-start xl:justify-start">
              {/* Cột trái: Nội dung */}
              <div className="w-full">
                <h1 className="mb-4 text-2xl font-bold text-primary md:text-3xl">Liên Hệ Với 7Teck</h1>
                <p className="mb-6 text-gray-700">Đội ngũ của chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7. Hãy chọn kênh liên lạc thuận tiện nhất:</p>

                <ul className="space-y-3 text-gray-800">
                  <li>
                    📞 Hotline:{' '}
                    <a href={hotlineUrl} className="font-semibold text-primary hover:underline">
                      0333 133 050
                    </a>
                  </li>
                  <li>
                    📧 Email:{' '}
                    <a href={mailUrl} className="font-semibold text-primary hover:underline">
                      cskh.7teck@gmail.com
                    </a>
                  </li>
                  <li>
                    📍 Địa chỉ:{' '}
                    <a href={ggMapShareUrl} target="_blank" className="font-semibold text-primary hover:underline">
                      {address}
                    </a>
                  </li>
                  <li>
                    💬 Messenger:{' '}
                    <a href={messengerUrl} target="_blank" className="text-primary hover:underline">
                      Chat ngay
                    </a>
                  </li>
                  <li>
                    💬 Zalo:{' '}
                    <a href={zaloUrl} target="_blank" className="text-primary hover:underline">
                      Zalo 0333 133 050
                    </a>
                  </li>
                  <li>
                    💬 Fanpage:{' '}
                    <a href={fanpageUrl} target="_blank" className="text-primary hover:underline">
                      facebook.com/7teck.vn
                    </a>
                  </li>
                </ul>

                {/* CTA */}
                <div className="mt-8">
                  <Link
                    href={messengerUrl}
                    target="_blank"
                    className="inline-block rounded-xl bg-primary px-8 py-3 font-semibold text-white shadow-md transition hover:bg-secondary"
                  >
                    Liên Hệ Ngay
                  </Link>
                </div>
              </div>

              {/* Cột phải: Hình ảnh */}
              <div className="flex w-full justify-center">
                <Image src={imagePages.ContactUsPage} alt="Đội ngũ liên hệ" width={600} height={400} className="h-full w-full rounded-xl shadow-lg" />
              </div>
            </div>
          </div>

          {/* Section 2: Bản đồ địa chỉ */}
          <div className="mt-10 rounded-xl bg-white p-2 shadow-md xl:p-6">
            <h2 className="mb-4 text-xl font-bold text-primary md:text-2xl">Vị Trí Cửa Hàng</h2>
            <p className="mb-4 text-gray-700">Ghé thăm chúng tôi tại địa chỉ: {address}</p>
            <div className="flex justify-center">
              <iframe
                src={ggMapEmbedUrl}
                width="100%"
                height="400"
                className="rounded-lg"
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>

          {/* Section 3: Form liên hệ */}
          <div className="mt-10 rounded-xl bg-white p-2 shadow-md xl:p-6">
            <h2 className="mb-4 text-xl font-bold text-primary md:text-2xl">Gửi Tin Nhắn Cho Chúng Tôi</h2>
            <form
              ref={formRef}
              onSubmit={onSubmit}
              className="flex flex-col items-center justify-center rounded-xl shadow-none dark:bg-white xl:flex-row xl:gap-x-10 xl:gap-y-0 xl:p-4 xl:shadow-mainMenu"
            >
              <div className="flex w-full flex-col gap-5" role="region" aria-label="Thông tin liên hệ">
                <div className="flex w-full flex-col gap-5 xl:flex-row">
                  <div className="w-full" aria-label="Số điện thoại hoặc Zalo">
                    <InputForm
                      name="Số điện thoại:"
                      type="number"
                      placeholder="Nhập số điện thoại/Zalo"
                      className="border border-gray-300 bg-white text-black focus:border-primary"
                      classNameLabel="bg-white dark:peer-placeholder-shown:text-black dark:peer-focus:text-black"
                    />
                  </div>
                  <div className="w-full" aria-label="Tên của bạn">
                    <InputForm
                      name="Tên khách hàng:"
                      type="text"
                      className="border border-gray-300 bg-white text-black focus:border-primary"
                      placeholder="Nhập tên của bạn"
                      classNameLabel="bg-white dark:peer-placeholder-shown:text-black dark:peer-focus:text-black"
                    />
                  </div>
                </div>
                <div className="w-full" aria-label="Nhập địa chỉ của bạn">
                  <InputForm
                    name="Địa chỉ:"
                    type="text"
                    placeholder="Nhập địa chỉ của bạn"
                    className="border border-gray-300 bg-white text-black focus:border-primary"
                    classNameLabel="bg-white dark:peer-placeholder-shown:text-black dark:peer-focus:text-black"
                  />
                </div>
                <div className="flex flex-col text-primary">
                  <LabelForm title={'*Có thể bỏ qua phần đặt lời nhắn!'} />
                  <Textarea
                    name="Lời nhắn:"
                    className="border border-gray-300 bg-white px-2 pb-20 text-black placeholder:text-[14px] placeholder:text-gray-500 focus:border-primary focus:outline-none"
                    placeholder="Hãy để lại lời nhắn tại đây. Chúng tôi luôn sẵn sàng giải đáp mọi thắc mắc của bạn!"
                  />
                </div>

                <div className="w-full">
                  <span>{result}</span>
                  <Button
                    aria-label="Nút: Gửi"
                    className="w-full bg-primary text-sm text-white hover:border-primary hover:bg-secondary hover:text-white dark:hover:bg-opacity-50"
                    type="submit"
                  >
                    Gửi
                  </Button>
                </div>
              </div>
            </form>
          </div>

          {/* Section 4: Mạng xã hội */}
          <div className="mt-10 rounded-xl bg-white p-2 shadow-md xl:p-6">
            <h2 className="mb-4 text-xl font-bold text-primary md:text-2xl">Kết Nối Với Chúng Tôi</h2>
            <div className="mb-2 flex flex-row items-center justify-center gap-5 text-5xl">
              {/* Facebook */}
              <Link title="Liên hệ qua Fanpage" target="_blank" href={fanpageUrl} className="rounded-full">
                <FaFacebook />
              </Link>
              {/* Messenger */}
              <Link title="Liên hệ qua Messenger" target="_blank" href={messengerUrl} className="rounded-full">
                <FaFacebookMessenger />
              </Link>
              {/* Zalo */}
              <Link
                title="Liên hệ qua Zalo"
                target="_blank"
                className="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-[#000000] text-[12px] font-semibold text-white shadow-md transition hover:scale-105"
                href={zaloUrl}
              >
                Zalo
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
