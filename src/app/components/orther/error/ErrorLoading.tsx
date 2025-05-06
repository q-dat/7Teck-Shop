'use client';
import { images } from '../../../../../public';
import Image from 'next/image';
import { IoMdRefreshCircle } from 'react-icons/io';

const ErrorLoading = () => {
  const navigate = () => {
    window.location.reload();
  };
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-36">
      <Image width={500} height={500} src={images.Logo} alt="NotFounds" className="w-[500px] object-cover drop-shadow-lg filter" />
      <div className="text-md flex flex-row items-center justify-center gap-3 text-secondary dark:text-green-500 xl:text-3xl">
        <p>Lỗi 404:</p>
        <p>Không tìm thấy dữ liệu!!!</p>
      </div>
      <button
        className="text-md gap-1 rounded-md border border-black bg-primary p-2 font-light text-black shadow-headerMenu shadow-primary transition-colors duration-500 hover:border-primary hover:bg-white hover:text-primary dark:border-none dark:bg-black dark:text-white dark:shadow-headerMenu dark:shadow-green-500 dark:hover:text-green-500 dark:hover:shadow-white"
        onClick={() => {
          navigate();
        }}
      >
        <span className="flex items-center gap-1">
          {' '}
          <IoMdRefreshCircle className="text-xl" />
          Quay lại!
        </span>
      </button>
    </div>
  );
};
export default ErrorLoading;
