'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link'; // thêm import
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FaShippingFast, FaShieldAlt, FaTags } from 'react-icons/fa';
import { images } from '../../../public/images';

gsap.registerPlugin(ScrollTrigger);

const programs = [
  {
    icon: <FaShippingFast className="text-5xl text-primary" />,
    title: 'Tư Vấn Chọn Máy Theo Nhu Cầu',
    subtitle: 'Hỗ trợ tìm sản phẩm phù hợp',
    desc: 'Chúng tôi giúp khách hàng lựa chọn điện thoại, laptop, PC theo từng mục đích: học tập, văn phòng, đồ họa hay gaming. Đội ngũ kỹ thuật sẽ giải thích chi tiết về cấu hình và hiệu năng để bạn chọn đúng sản phẩm cần thiết.',
    badge: 'Expert',
    cta: 'Nhận Tư Vấn',
    link: '/tu-van',
    bg: `${images.Ip16PM}`,
  },
  {
    icon: <FaShieldAlt className="text-5xl text-primary" />,
    title: 'Cam Kết Hàng Chính Hãng',
    subtitle: 'Bảo hành minh bạch',
    desc: 'Tất cả sản phẩm đều nhập chính ngạch từ Apple, Dell, Asus, HP… và đi kèm đầy đủ hóa đơn VAT. Chế độ bảo hành rõ ràng, có hỗ trợ 1 đổi 1 nếu lỗi do nhà sản xuất, giúp khách hàng yên tâm khi mua sắm lâu dài.',
    badge: 'Trust',
    cta: 'Xem Chi Tiết',
    link: '/chinh-sach-bao-hanh',
    bg: `${images.MacProM4}`,
  },
  {
    icon: <FaTags className="text-5xl text-primary" />,
    title: 'Thu Cũ Đổi Mới & Trả Góp Linh Hoạt',
    subtitle: 'Giải pháp mua sắm dễ dàng',
    desc: 'Khách hàng có thể đổi thiết bị cũ lấy máy mới với mức giá thu hợp lý. Ngoài ra, chúng tôi hỗ trợ thanh toán trả góp linh hoạt qua thẻ tín dụng, giúp bạn dễ dàng sở hữu điện thoại, laptop hoặc PC mà không cần chi trả toàn bộ ngay từ đầu.',
    badge: 'Value',
    cta: 'Tìm Hiểu Thêm',
    link: '/bang-gia-thu-mua',
    bg: `${images.OppoReno14}`,
  },
  {
    icon: <FaShippingFast className="text-5xl text-primary" />,
    title: 'Dịch Vụ Cài Đặt & Hỗ Trợ 24/7',
    subtitle: 'Đồng hành cùng khách hàng',
    desc: 'Tất cả máy khi mua đều được cài đặt phần mềm cơ bản miễn phí: Windows bản quyền, Office, diệt virus, drivers và tối ưu hiệu suất. Đội ngũ kỹ thuật hỗ trợ online 24/7, sẵn sàng giải đáp mọi thắc mắc trong quá trình sử dụng.',
    badge: 'Support',
    cta: 'Liên Hệ',
    link: '/lien-he',
    bg: `${images.LaptopDell}`,
  },
];

const BenefitsSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const sections = gsap.utils.toArray<HTMLElement>('.benefit-card');

    gsap.to(sections, {
      xPercent: -100 * (sections.length - 1),
      ease: 'none',
      scrollTrigger: {
        trigger: container,
        pin: true,
        scrub: 0,
        start: 'center center',
        end: () => `+=${container.scrollWidth - window.innerWidth}`,
      },
    });
  }, []);

  return (
    <section ref={containerRef} className="relative z-[9999998] w-full overflow-hidden">
      <div className="flex h-screen w-max flex-row">
        {programs.map((p, i) => (
          <div
            key={i}
            className="benefit-card relative flex w-screen flex-col items-center justify-center bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${p.bg})`,
            }}
          >
            {/* overlay gradient */}
            <div className="absolute inset-0 bg-black/20" />

            <div className="relative z-10 mx-2 max-w-2xl rounded-2xl bg-white/60 p-6 text-center shadow-lg backdrop-blur-md md:mx-0 md:p-8">
              {/* badge */}
              <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-sm font-semibold text-white shadow-md">{p.badge}</span>

              <div className="mb-4 flex justify-center">{p.icon}</div>
              <h1 className="mb-1 text-xl font-bold text-gray-900 md:text-3xl">{p.title}</h1>
              <p className="mb-2 text-xs italic text-gray-600 xl:text-sm">{p.subtitle}</p>
              <p className="mb-3 text-sm text-gray-700 md:text-lg xl:text-base">{p.desc}</p>

              {/* CTA link */}
              <Link
                href={p.link}
                className="inline-block rounded-lg bg-primary px-5 py-2 font-medium text-white shadow transition hover:bg-primary/90"
              >
                {p.cta}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BenefitsSection;
