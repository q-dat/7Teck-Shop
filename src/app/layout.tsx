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
import Script from 'next/script';
import { homeMetadata } from '@/metadata/homeMetadata';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata = homeMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" data-theme="mytheme">
      <head>
        {/* Script Google SWG - async external */}
        <Script async src="https://news.google.com/swg/js/v1/swg-basic.js" strategy="afterInteractive" />
        {/* Inline init script */}
        <Script id="swg-init" strategy="afterInteractive">
          {`
          (self.SWG_BASIC = self.SWG_BASIC || []).push(basicSubscriptions => {
            basicSubscriptions.init({
              type: "NewsArticle",
              isPartOfType: ["Product"],
              isPartOfProductId: "CAowlNO8DA:openaccess",
              clientOptions: { theme: "light", lang: "vi" },
            });
          });
        `}
        </Script>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ErrorBoundary>
          <div className="flex min-h-screen flex-col bg-primary-white xl:pt-[130px]">
            <Header />
            <div className="flex-1 bg-primary-white selection:bg-primary selection:text-white xl:pt-0">{children}</div>
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
