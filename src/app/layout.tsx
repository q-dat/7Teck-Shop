import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import type { Metadata } from 'next';
import { ToastContainer } from 'react-toastify';
import ErrorBoundary from '@/components/orther/error/ErrorBoundary';
import ScrollToTopButton from '@/components/orther/scrollToTop/ScrollToTopButton';
import ContactForm from '@/components/userPage/ContactForm';
import NavBottom from '@/components/userPage/NavBottom';
import NotificationPopup from '@/components/userPage/NotificationPopup';
import FooterFC from '@/components/userPage/ui/Footer';
import Header from '@/components/userPage/ui/Header';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  icons: {
    icon: '/favicon.png',
  },
  title: 'Mua Điện Thoại, Laptop, MacBook Giá Rẻ Chính Hãng - Giao Nhanh tại 7teck.vn',
  description:
    'Khám phá điện thoại, máy tính bảng, laptop Windows, MacBook chính hãng tại 7teck.vn. Ưu đãi cực sốc, bảo hành chính hãng, giao hàng toàn quốc!',
  keywords: [
    'mua điện thoại chính hãng',
    'điện thoại giá rẻ',
    'smartphone 2025',
    'máy tính bảng chính hãng',
    'tablet giá tốt',
    'laptop Windows 2025',
    'laptop giá rẻ cho sinh viên',
    'mua MacBook chính hãng',
    'MacBook M3 giá tốt',
    'laptop văn phòng',
    'thiết bị công nghệ 2025',
    '7teck.vn điện tử',
    'cửa hàng laptop uy tín',
    'giao hàng nhanh toàn quốc',
    'bảo hành điện tử',
    'thiết bị Apple chính hãng',
    'điện thoại Android mới nhất',
  ],
  robots: 'index, follow',
  metadataBase: new URL('https://www.7teck.vn'),
  openGraph: {
    title: 'Mua Điện Thoại, Laptop, MacBook Giá Rẻ Chính Hãng - Giao Nhanh tại 7teck.vn',
    description: 'Điện thoại, máy tính bảng, laptop chính hãng với giá cực tốt tại 7teck.vn. Giao nhanh, hỗ trợ trả góp, hàng chính hãng 100%!',
    url: 'https://www.7teck.vn',
    siteName: '7teck.vn',
    images: [
      {
        url: '/favicon.png',
        width: 1200,
        height: 630,
        alt: 'Thiết bị công nghệ chính hãng tại 7teck.vn',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mua Điện Thoại, Laptop, MacBook Giá Rẻ Chính Hãng - Giao Nhanh tại 7teck.vn',
    description: 'Khuyến mãi sốc điện thoại, laptop, MacBook tại 7teck.vn. Hàng chính hãng, giao siêu tốc, bảo hành uy tín!',
    images: ['/favicon.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="mytheme">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ErrorBoundary>
          <div className="flex min-h-screen flex-col bg-primary-white xl:pt-[130px]">
            <Header />
            <div className="flex-1 bg-primary-white selection:bg-primary selection:text-black xl:pt-0">{children}</div>
            <NotificationPopup />
            <ScrollToTopButton />
            <NavBottom />
            <ContactForm />
            <FooterFC />
          </div>
          <ToastContainer style={{ marginTop: '50px' }} />
        </ErrorBoundary>
      </body>
    </html>
  );
}
