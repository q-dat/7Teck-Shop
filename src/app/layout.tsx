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
    icon: '/favicon.ico',
  },
  title: 'Deal Rẻ Mỗi Ngày, Chất Lượng Chính Hãng! - Biểu tượng phong cách nam, Đồng hồ sang trọng, Mỹ phẩm cao cấp',
  description: 'Mua ví COACH nam, đồng hồ và mỹ phẩm cao cấp chính hãng tại Lazzie Shop. Giá tốt, giao nhanh!',
  keywords: [
    'Lazzie Shop',
    ' ví COACH nam',
    ' ví da cao cấp',
    ' ví chính hãng',
    ' ví nam giá rẻ',
    ' ví card',
    ' ví đựng thẻ',
    ' đồng hồ nam',
    ' đồng hồ cao cấp',
    ' đồng hồ chính hãng',
    ' mỹ phẩm cao cấp',
    ' son môi',
    ' nước hoa chính hãng',
    ' nước hoa cao cấp',
    ' phụ kiện nam',
    ' mua ví nam online',
    ' Lazzie Shop giá tốt',
  ],
  robots: 'index, follow',
  metadataBase: new URL('https://www.lazzie.shop'),
  openGraph: {
    title: 'Deal Rẻ Mỗi Ngày, Chất Lượng Chính Hãng! - Biểu tượng phong cách nam, Đồng hồ sang trọng, Mỹ phẩm cao cấp',
    description: 'Mua ví COACH nam, đồng hồ và mỹ phẩm cao cấp chính hãng tại Lazzie Shop. Giá tốt, giao nhanh!',
    url: 'https://www.lazzie.shop',
    siteName: 'Lazzie Shop',
    images: [
      {
        url: '/favicon.ico',
        width: 1200,
        height: 630,
        alt: 'Lazzie Shop - Phụ Kiện Nam Cao Cấp',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Deal Rẻ Mỗi Ngày, Chất Lượng Chính Hãng! - Biểu tượng phong cách nam, Đồng hồ sang trọng, Mỹ phẩm cao cấp',
    description: 'Mua ví COACH nam, đồng hồ và mỹ phẩm cao cấp chính hãng tại Lazzie Shop. Giá tốt, giao nhanh!',
    images: ['/favicon.ico'],
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
            <div className="flex-1 bg-primary-white py-[60px] selection:bg-primary selection:text-black xl:pt-0">{children}</div>
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
