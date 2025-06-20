'use client';
import React, { useEffect, useRef, useState } from 'react';
import HeaderResponsive from '../../components/userPage/HeaderResponsive';
import { Textarea, Button } from 'react-daisyui';
import { scrollToTopSmoothly } from '../../utils/scrollToTopSmoothly';
import { Toastify } from '@/helper/Toastify';
import Link from 'next/link';
import InputForm from '@/components/userPage/InputForm';
import LabelForm from '@/components/userPage/LabelForm';
import Image from 'next/image';
import imageRepresent from '../../../public/image-represent';
import { messengerUrl, zaloUrl } from '@/utils/socialLinks';

export default function PurchasePage() {
  const [result, setResult] = React.useState<string>('');
  const formRef = useRef<HTMLFormElement>(null);
  const fallbackSrc = `${imageRepresent.Fallback}`;
  const mainZaloQRSrc = `${imageRepresent.ZaloQR}`;
  const mainMessageQRSrc = `${imageRepresent.Message}`;

  // State to manage the image source
  const [imgZaloQRSrc, setImgZaloQRSrc] = useState(mainZaloQRSrc);
  const [imgMessageQRSrc, setImgMessageQRSrc] = useState(mainMessageQRSrc);

  useEffect(() => {
    scrollToTopSmoothly();
  });
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
      <HeaderResponsive Title_NavbarMobile="Mua Hàng" />
      <div className="py-[60px] xl:pt-0">
        <div className="breadcrumbs px-[10px] py-2 text-sm text-black shadow dark:text-white xl:px-desktop-padding">
          <ul className="font-light">
            <li>
              <Link aria-label="Trang chủ" href="/">
                Trang Chủ
              </Link>
            </li>
            <li>
              <Link aria-label="Mua Hàng" href="">
                Mua Hàng
              </Link>
            </li>
          </ul>
        </div>
        {/* Contact */}
        <div className="mt-5 px-2 xl:px-desktop-padding">
          <div role="region" aria-label="Thông tin liên hệ">
            <h1 className="text-2xl font-bold">Liên Hệ Thanh Toán Trực Tiếp</h1>
          </div>
          {/*  */}
          <div className="mt-4 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            {/* Social */}
            {/* Zalo */}
            <div className="flex w-full flex-col items-start justify-start gap-5 xl:items-center">
              <div className="w-full text-start">
                <h2 className="text-xl font-bold">Cách 1: Liên hệ trực tiếp qua Zalo</h2>
                <p className="text-sm text-gray-500">
                  Quét mã QR hoặc truy cập qua link Zalo: <br />
                  <Link className="font-semibold text-blue-600 underline" href={zaloUrl} target="_blank">
                    {zaloUrl}
                  </Link>
                </p>
              </div>
              {/* Image with fallback */}
              <Image
                src={imgZaloQRSrc}
                alt="Img"
                width={300}
                height={300}
                className="h-full w-full xl:w-[300px]"
                onError={() => setImgZaloQRSrc(fallbackSrc)}
              />
            </div>
            {/* Message */}
            <div className="flex w-full flex-col items-start justify-start gap-5 xl:items-center">
              <div className="w-full text-start">
                <h2 className="text-xl font-bold">Cách 2: Liên hệ trực tiếp qua Message</h2>
                <p className="text-sm text-gray-500">
                  Quét mã QR hoặc truy cập qua link Message: <br />
                  <Link className="font-semibold text-blue-600 underline" href={messengerUrl} target="_blank">
                    {messengerUrl}
                  </Link>
                </p>
              </div>
              {/* Image with fallback */}

              <Image
                src={imgMessageQRSrc}
                alt="Img"
                width={300}
                height={300}
                className="h-full w-full xl:w-[300px]"
                onError={() => setImgMessageQRSrc(fallbackSrc)}
              />
            </div>
            {/* Form */}
            <div className="w-full space-y-5">
              <div>
                <h2 className="text-xl font-bold">Cách 3: Điền thông tin liên hệ</h2>
                <p className="text-sm text-gray-500">
                  Để lại thông tin liên hệ của bạn để chúng tôi có thể hỗ trợ bạn tốt nhất. <br />
                  Chúng tôi sẽ liên hệ lại với bạn trong thời gian sớm nhất. <br />
                  Nếu bạn cần hỗ trợ ngay lập tức, vui lòng liên hệ qua Zalo hoặc Messenger.
                </p>
              </div>
              <form
                ref={formRef}
                onSubmit={onSubmit}
                className="flex flex-col items-center justify-center gap-y-10 rounded-xl shadow-none dark:bg-white xl:flex-row xl:gap-x-10 xl:gap-y-0 xl:p-4 xl:shadow-mainMenu"
              >
                <div className="flex w-full flex-col gap-5" role="region" aria-label="Thông tin liên hệ">
                  <div className="flex w-full flex-col gap-5 xl:flex-row">
                    <div className="w-full" aria-label="Số điện thoại hoặc Zalo">
                      <InputForm
                        name="Số điện thoại:"
                        type="number"
                        placeholder="Nhập số điện thoại"
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
                  <div className="flex flex-col text-primary">
                    <LabelForm title={'*Có thể bỏ qua phần đặt câu hỏi!'} />
                    <Textarea
                      name="Lời nhắn:"
                      className="border border-gray-300 bg-white px-2 pb-20 text-black placeholder:text-[14px] placeholder:text-gray-500 focus:border-primary focus:outline-none"
                      placeholder="Hãy để lại câu hỏi tại đây. Chúng tôi luôn sẵn sàng giải đáp mọi câu hỏi của bạn!"
                    />
                  </div>
                  <div className="w-full">
                    <Button
                      aria-label="Nút: Gửi"
                      className="w-full bg-primary text-sm text-white hover:border-primary hover:bg-secondary hover:text-white dark:hover:bg-opacity-50"
                      type="submit"
                    >
                      Gửi
                    </Button>
                    <span>{result}</span>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
