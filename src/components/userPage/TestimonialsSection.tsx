'use client';
import Image from 'next/image';
import { FaQuoteLeft } from 'react-icons/fa';

const testimonials = [
  {
    name: 'Nguyễn Văn A',
    comment: 'Mua laptop ở 7Teck, giá tốt và giao hàng cực nhanh. Sẽ quay lại ủng hộ!',
    avatar: '/images/user1.jpg',
  },
  {
    name: 'Trần Thị B',
    comment: 'iPhone chính hãng, bảo hành rõ ràng. Nhân viên tư vấn rất nhiệt tình.',
    avatar: '/images/user2.jpg',
  },
  {
    name: 'Lê Văn C',
    comment: 'Máy tính bảng chất lượng, đóng gói cẩn thận. Rất hài lòng.',
    avatar: '/images/user3.jpg',
  },
];

export default function TestimonialSection() {
  return (
    <section className="px-2 py-10 xl:px-desktop-padding">
      <div className="w-full px-6 text-center">
        <h2 className="mb-12 text-3xl font-semibold">Khách hàng nói gì</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((t, idx) => (
            <div key={idx} className="rounded-2xl bg-white p-6 shadow transition hover:shadow-lg">
              <FaQuoteLeft className="mx-auto mb-4 text-2xl text-blue-600" />
              <p className="italic text-gray-700">{`"${t.comment}"`}</p>
              <div className="mt-6 flex flex-col items-center">
                <Image src={t.avatar} alt={t.name} width={50} height={50} className="mb-2 h-12 w-12 rounded-full object-cover" />
                <span className="font-medium">{t.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
