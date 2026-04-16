'use client';
import { motion } from 'framer-motion';
import { FaFacebookMessenger, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaInstagram, FaClock } from 'react-icons/fa';
import { fanpageUrl, messengerUrl, zaloUrl, hotlineUrl, mailUrl, mail, address, contact, ggMapEmbedUrl } from '@/utils/socialLinks';

export default function AdvancedContactSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <section className="overflow-hidden bg-white">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-1 gap-6 lg:grid-cols-12"
      >
        {/* LEFT COLUMN: CONTACT BENTO (5 columns) */}
        <div className="grid grid-cols-2 gap-4 lg:col-span-5">
          {/* Main Contact Card - Featured */}
          <motion.div variants={itemVariants} className="group relative col-span-2 overflow-hidden rounded-2xl bg-primary p-6 text-white shadow-xl">
            <div className="relative z-10">
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary-lighter/80">Hotline 24/7</p>
              <h2 className="mb-4 text-3xl font-black tracking-tighter">{contact}</h2>
              <a
                href={hotlineUrl}
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-primary transition-transform hover:scale-105"
              >
                <FaPhoneAlt size={14} /> Gọi ngay cho chúng tôi
              </a>
            </div>
            <FaPhoneAlt className="absolute -bottom-4 -right-4 rotate-12 text-9xl text-white/10 transition-transform group-hover:rotate-0 group-hover:scale-110" />
          </motion.div>

          {/* Social Channels - Bento Items */}
          {[
            { label: 'Messenger', icon: <FaFacebookMessenger />, url: messengerUrl, color: 'bg-blue-500', text: 'Tư vấn FB' },
            { label: 'Zalo', icon: <span className="text-lg font-bold italic">Z</span>, url: zaloUrl, color: 'bg-blue-400', text: 'Chat Zalo' },
            { label: 'Facebook', icon: <FaFacebook />, url: fanpageUrl, color: 'bg-indigo-600', text: 'Fanpage' },
            { label: 'Instagram', icon: <FaInstagram />, url: 'https://instagram.com', color: 'bg-pink-500', text: 'Instagram' },
          ].map((item, idx) => (
            <motion.a
              key={idx}
              variants={itemVariants}
              href={item.url}
              target="_blank"
              className={`flex flex-col items-center justify-center rounded-2xl p-4 ${item.color} text-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-2xl`}
            >
              <span className="mb-1 text-2xl">{item.icon}</span>
              <span className="text-[10px] font-bold uppercase tracking-wide opacity-90">{item.text}</span>
            </motion.a>
          ))}

          {/* Business Hours Section - Lấp đầy khoảng trống lề dưới */}
          <motion.div variants={itemVariants} className="col-span-2 flex items-center gap-4 rounded-2xl border border-primary/10 bg-primary/5 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <FaClock size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-black/40">Giờ làm việc</p>
              <p className="text-sm font-bold text-black/80">08:00 - 21:00 (Thứ 2 - Chủ Nhật)</p>
            </div>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: GOOGLE MAP & INFO (7 columns) */}
        <div className="space-y-6 lg:col-span-7">
          {/* Address Card */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col justify-between gap-4 rounded-2xl border border-black/5 bg-white p-5 shadow-sm md:flex-row md:items-center"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/5 text-primary">
                <FaMapMarkerAlt size={22} />
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-black/40">Trụ sở chính</p>
                <p className="text-sm font-bold leading-relaxed text-black/80">{address}</p>
                <p className="text-xs text-black/50">{mail}</p>
              </div>
            </div>
            <a
              href={mailUrl}
              className="flex h-10 items-center justify-center gap-2 rounded-xl border border-primary/20 px-6 text-xs font-bold uppercase tracking-wide text-primary transition-colors hover:bg-primary hover:text-white"
            >
              <FaEnvelope /> Gửi Email
            </a>
          </motion.div>

          {/* Google Maps Embed - High End UI */}
          <motion.div
            variants={itemVariants}
            className="group relative h-[300px] w-full overflow-hidden rounded-2xl border border-black/5 shadow-inner lg:h-full lg:min-h-[380px]"
          >
            <iframe
              src={ggMapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="7teck Google Map"
              className="contrast-[1.1] grayscale-[0.2] transition-all duration-700 group-hover:scale-[1.02] group-hover:grayscale-0"
            ></iframe>

            {/* Overlay Map UI */}
            <div className="pointer-events-none absolute left-4 right-4 top-4">
              <div className="inline-flex items-center gap-2 rounded-lg border border-black/5 bg-white/90 px-3 py-1.5 shadow-md backdrop-blur-md">
                <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
                <span className="text-[10px] font-bold text-black/70">7TECK ĐANG MỞ CỬA</span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
