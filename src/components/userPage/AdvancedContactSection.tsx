'use client';

import { fanpageUrl, messengerUrl, zaloUrl, hotlineUrl, mailUrl, mail, address, contact, ggMapEmbedUrl, instagramUrl } from '@/utils/socialLinks';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  FaCheckCircle,
  FaClock,
  FaComments,
  FaEnvelope,
  FaFacebook,
  FaFacebookMessenger,
  FaInstagram,
  FaLaptop,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaShippingFast,
} from 'react-icons/fa';

interface ContactChannel {
  label: string;
  title: string;
  desc: string;
  url: string;
  className: string;
  icon: React.ReactNode;
}

interface SupportItem {
  title: string;
  desc: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const contactChannels: ContactChannel[] = [
  {
    label: 'Messenger',
    title: 'Facebook',
    desc: 'Tư vấn qua Messenger',
    url: messengerUrl,
    className: 'border-secondary/20 bg-secondary-lighter text-secondary hover:border-secondary/40 hover:bg-secondary-lighter/80',
    icon: <FaFacebookMessenger size={18} />,
  },
  {
    label: 'Zalo',
    title: 'Zalo',
    desc: 'Chat nhanh với 7Teck',
    url: zaloUrl,
    className: 'border-secondary/20 bg-secondary-lighter text-secondary hover:border-secondary/40 hover:bg-secondary-lighter/80',
    icon: <span className="text-sm font-black leading-none">Zalo</span>,
  },
  {
    label: 'Fanpage',
    title: 'Fanpage',
    desc: 'Theo dõi sản phẩm mới',
    url: fanpageUrl,
    className: 'border-info/20 bg-info/5 text-info hover:border-info/40 hover:bg-info/10',
    icon: <FaFacebook size={18} />,
  },
  {
    label: 'Instagram',
    title: 'Instagram',
    desc: 'Hình ảnh và cập nhật',
    url: instagramUrl,
    className: 'border-primary/20 bg-primary-lighter text-primary hover:border-primary/40 hover:bg-primary-lighter/80',
    icon: <FaInstagram size={18} />,
  },
];

const supportItems: SupportItem[] = [
  {
    title: 'Tư vấn cấu hình',
    desc: 'Chọn máy theo nhu cầu',
    icon: FaLaptop,
  },
  {
    title: 'Đúng tình trạng',
    desc: 'Báo rõ trước khi mua',
    icon: FaCheckCircle,
  },
  {
    title: 'Giao máy linh hoạt',
    desc: 'Hỗ trợ giao trong ngày',
    icon: FaShippingFast,
  },
  {
    title: 'Hỗ trợ nhanh',
    desc: 'Zalo, Messenger, Hotline',
    icon: FaComments,
  },
];

const containerVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      staggerChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export default function AdvancedContactSection() {
  return (
    <section className="overflow-hidden rounded-lg border border-btn-section-border bg-primary-white shadow-sm">
      <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}>
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(340px,4fr)_minmax(0,8fr)]">
          <motion.div variants={itemVariants} className="relative overflow-hidden bg-default p-2 text-white xl:p-4">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/35 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 left-8 h-56 w-56 rounded-full bg-secondary/25 blur-3xl" />

            <div className="relative z-10 flex h-full flex-col justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/10 px-2 py-1 backdrop-blur">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  <span className="text-[10px] font-bold uppercase tracking-wide text-white/75">Hỗ trợ</span>
                </div>

                <h2 className="mt-3 text-2xl font-black leading-tight tracking-tight xl:text-4xl">Cần tư vấn thêm trước khi mua?</h2>

                <p className="mt-2 text-sm leading-6 text-white/70">
                  7Teck hỗ trợ kiểm tra thông tin sản phẩm, tình trạng máy, cấu hình phù hợp và hình thức nhận hàng.
                </p>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/10 p-2 shadow-2xl shadow-default/20 backdrop-blur">
                <p className="text-[11px] font-bold uppercase tracking-wide text-white/50">Hotline tư vấn</p>

                <Link
                  href={hotlineUrl}
                  className="mt-1 block text-3xl font-black tracking-tight text-white transition-colors hover:text-primary-lighter"
                >
                  {contact}
                </Link>

                <div className="mt-3 grid grid-cols-1 gap-2">
                  <Link
                    href={hotlineUrl}
                    className="flex h-11 items-center justify-center gap-2 rounded-md bg-primary text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-primary/90"
                  >
                    <FaPhoneAlt size={14} />
                    Gọi ngay
                  </Link>

                  <Link
                    href={zaloUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-11 items-center justify-center gap-2 rounded-md border border-white/15 bg-white/10 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-white/15"
                  >
                    Chat Zalo
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {supportItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div key={item.title} className="rounded-lg border border-white/10 bg-white/[0.06] p-2 backdrop-blur">
                      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/20 text-primary-lighter">
                        <Icon size={14} />
                      </span>
                      <p className="mt-2 text-sm font-bold leading-5 text-white">{item.title}</p>
                      <p className="mt-0.5 text-xs leading-5 text-white/55">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="grid min-w-0 grid-cols-1 gap-2 bg-primary-white p-2 xl:grid-cols-[minmax(0,7fr)_minmax(320px,5fr)] xl:p-2"
          >
            <div className="relative min-h-[340px] overflow-hidden rounded-lg border border-btn-section-border bg-white shadow-sm xl:min-h-[500px]">
              <iframe
                src={ggMapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="7Teck Google Map"
                className="absolute inset-0 h-full w-full grayscale-[0.06] transition-all duration-500 hover:grayscale-0"
              />

              <div className="pointer-events-none absolute left-2 top-2">
                <div className="inline-flex items-center gap-2 rounded-md border border-btn-section-border bg-white/95 px-3 py-2 shadow-sm backdrop-blur">
                  <span className="h-2 w-2 rounded-full bg-success" />
                  <span className="text-[10px] font-bold uppercase tracking-wide text-black">Đang hỗ trợ khách hàng</span>
                </div>
              </div>

              <div className="pointer-events-none absolute inset-x-2 bottom-2">
                <div className="rounded-lg border border-btn-section-border bg-white/95 p-2 shadow-sm backdrop-blur">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-gray-300">Địa chỉ 7Teck</p>
                  <p className="mt-1 line-clamp-2 text-sm font-bold leading-6 text-black">{address}</p>
                </div>
              </div>
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-2">
              <div className="rounded-lg border border-btn-section-border bg-white p-2 shadow-sm">
                <div className="flex items-start gap-2">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-lighter text-primary">
                    <FaMapMarkerAlt size={18} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-gray-300">Thông tin cửa hàng</p>
                    <p className="mt-1 text-sm font-bold leading-6 text-black">{address}</p>
                    <p className="mt-1 break-all text-sm leading-6 text-gray-300">{mail}</p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2">
                  <Link
                    href={mailUrl}
                    className="flex h-10 items-center justify-center gap-2 rounded-md border border-btn-section-border bg-primary-white text-sm font-bold text-black transition-colors hover:border-primary/40 hover:bg-primary-lighter hover:text-primary"
                  >
                    <FaEnvelope size={14} />
                    Gửi Email
                  </Link>

                  <Link
                    href={hotlineUrl}
                    className="flex h-10 items-center justify-center gap-2 rounded-md border border-btn-section-border bg-primary-white text-sm font-bold text-black transition-colors hover:border-primary/40 hover:bg-primary-lighter hover:text-primary"
                  >
                    <FaPhoneAlt size={14} />
                    Liên hệ trực tiếp
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {contactChannels.map((item) => (
                  <motion.a
                    key={item.label}
                    variants={itemVariants}
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className={`group rounded-lg border p-2 shadow-sm transition-colors ${item.className}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex h-9 w-9 items-center justify-center rounded-md bg-white shadow-sm">{item.icon}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wide opacity-70">{item.label}</span>
                    </div>

                    <p className="mt-3 text-sm font-bold leading-5 text-black group-hover:text-current">{item.title}</p>
                    <p className="mt-0.5 line-clamp-1 text-xs font-medium leading-5 text-gray-300 group-hover:text-current">{item.desc}</p>
                  </motion.a>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-2 xl:grid-cols-2">
                <div className="rounded-lg border border-btn-section-border bg-white p-2 shadow-sm">
                  <div className="flex items-start gap-2">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary-lighter text-secondary">
                      <FaClock size={18} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-gray-300">Giờ làm việc</p>
                      <p className="mt-1 text-sm font-bold leading-6 text-black">24/7</p>
                      <p className="text-sm leading-6 text-gray-300">Thứ 2 - Chủ Nhật</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-primary/20 bg-primary p-2 text-white shadow-sm">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-white/60">Ưu tiên hỗ trợ</p>
                  <p className="mt-1 text-sm font-bold leading-6 text-white">Zalo hoặc gọi trực tiếp</p>
                  <p className="text-sm leading-6 text-white/70">Phản hồi nhanh hơn khi cần xem máy.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
