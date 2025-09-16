'use client';
import Image from 'next/image';
import { images } from '../../../../public/images';

export default function Section3() {
  return (
    <section className="relative z-20 hidden h-[100vh] w-full px-desktop-padding 2xl:block">
      <div className="flex w-full flex-row items-end">
        <div className="mb-4 w-1/2 text-left">
          <h1 className="mb-4 text-7xl font-bold">Hiệu năng A19 Pro</h1>
          <Image
            src={images.A19pro}
            alt="iPhone 17 Pro Max Chip"
            width={200}
            height={200}
            className="float-left mr-2 h-[200px] w-[200px] rounded-md object-contain"
          />
          <p className="mb-4 text-2xl">Chip A19 Pro tiến trình 2nm + 12GB RAM, sức mạnh vượt trội cho đa nhiệm, gaming và sáng tạo nội dung.</p>
          <p className="mb-4 text-sm italic text-gray-100 2xl:text-xl">
            GPU 6 nhân hỗ trợ ray tracing thời gian thực, chơi game AAA mượt mà, chỉnh sửa video 4K nhanh chóng.
          </p>
          <p className="text-sm italic text-gray-100 2xl:text-xl">
            Neural Engine thế hệ mới tăng tốc AI gấp đôi, trong khi pin tối ưu cho phép dùng thoải mái 2 ngày liên tục.
          </p>
        </div>
        <div className="relative w-1/2 p-2">{''}</div>
      </div>
    </section>
  );
}
