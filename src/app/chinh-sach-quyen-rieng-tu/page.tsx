// app/privacy/page.tsx
import Image from 'next/image';
import { images } from '../../../public/images';
import { address, contact, hotlineUrl, mail, mailUrl } from '@/utils/socialLinks';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen w-full bg-white px-2 py-12 text-black">
      <div className="mx-auto max-w-5xl space-y-10">
        <div className="flex flex-col items-center">
          <Image
            width={160}
            height={160}
            src={images.Logo}
            alt="7teck Logo"
            className="h-[120px] w-[120px] rounded-full object-contain md:h-[160px] md:w-[160px]"
            loading="lazy"
          />
          <h1 className="mt-6 text-center text-4xl font-bold uppercase text-[#a92d30]">Chính sách quyền riêng tư</h1>
        </div>
        <section className="space-y-6 text-lg leading-relaxed">
          <p>Chúng tôi cam kết bảo vệ quyền riêng tư và thông tin cá nhân của khách hàng khi truy cập 7teck.vn.</p>

          <div>
            <h2 className="mb-2 text-2xl font-semibold text-[#a92d30]">1. Dữ liệu được thu thập</h2>
            <p>Bao gồm: tên, email, số điện thoại, địa chỉ giao hàng và lịch sử mua hàng.</p>
          </div>

          <div>
            <h2 className="mb-2 text-2xl font-semibold text-[#a92d30]">2. Mục đích sử dụng</h2>
            <p>Dữ liệu giúp chúng tôi cải thiện dịch vụ, cá nhân hoá trải nghiệm và xử lý đơn hàng hiệu quả.</p>
          </div>

          <div>
            <h2 className="mb-2 text-2xl font-semibold text-[#a92d30]">3. Bảo mật thông tin</h2>
            <p>7teck.vn áp dụng các biện pháp kỹ thuật và quy trình bảo mật để bảo vệ thông tin cá nhân của khách hàng.</p>
          </div>
        </section>
        {/* Footer - Liên hệ */}
        <div className="mt-10 border-t border-gray-200 pt-8 text-center text-base">
          <h2 className="mb-4 text-2xl font-semibold text-[#a92d30]">Liên hệ với chúng tôi</h2>
          <p className="mb-2">Nếu quý khách có thắc mắc về nội dung Chính sách quyền riêng tư, vui lòng liên hệ:</p>
          <p className="mb-1">
            📞 <strong>Hotline:</strong>
            <a href={hotlineUrl} className="text-[#a92d30]">
              {contact}
            </a>
          </p>
          <p className="mb-1">
            📧 <strong>Email:</strong>
            <a href={mailUrl} className="text-[#a92d30]">
              {mail}
            </a>
          </p>
          <p>
            🏢 <strong>Địa chỉ:</strong> {address}
          </p>
        </div>
        <footer className="text-center text-sm text-gray-500">Cập nhật lần cuối: 26/06/2025</footer>
      </div>
    </main>
  );
}
