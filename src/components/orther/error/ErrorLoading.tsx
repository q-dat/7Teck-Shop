'use client';
import { Button } from 'react-daisyui';
import { IoMdRefreshCircle } from 'react-icons/io';
import HeaderResponsive from '../../userPage/ui/HeaderResponsive';
import imageRepresent from '../../../../public/image-represent';
import Image from 'next/image';

export default function ErrorLoading() {
  const navigate = () => {
    window.location.reload();
  };
  return (
    <div>
      <HeaderResponsive Title_NavbarMobile="404" />
      <div className="flex flex-col items-center justify-center gap-2 py-36">
        <Image src={imageRepresent.NotFounds} width={500} height={500} alt="" className="h-auto w-[500px] object-cover drop-shadow-lg filter" />
        <div className="text-md gap-3 text-secondary xl:text-3xl">
          <p>Không tìm thấy dữ liệu!!!</p>
        </div>
        <Button
          size="sm"
          className="text-md gap-1 rounded-md bg-primary font-light text-white shadow-headerMenu shadow-primary transition-colors duration-500 hover:border-primary hover:bg-white hover:text-primary dark:border-none dark:bg-black dark:text-white dark:shadow-headerMenu dark:shadow-green-500 dark:hover:text-green-500 dark:hover:shadow-white"
          onClick={() => {
            navigate();
          }}
        >
          <IoMdRefreshCircle className="text-xl" />
          Làm mới!
        </Button>
      </div>
    </div>
  );
}
