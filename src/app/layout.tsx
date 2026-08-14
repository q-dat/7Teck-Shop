import './globals.css';
import { homeMetadata } from '@/app/(website)/(SEO)/metadata/homeMetadata';
import { Inter, Roboto_Mono } from 'next/font/google';
import { Metadata } from 'next';

const geistSans = Inter({
    variable: '--font-geist-sans',
    subsets: ['latin'],
    display: 'swap', // Giảm CLS
});

const geistMono = Roboto_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
    display: 'swap', // Giảm CLS
});

export const metadata = {
    ...homeMetadata,
    icons: {
        icon: {
            url: '/favicon.png',
            type: 'image/png',
        },
        shortcut: '/favicon.png',
        apple: '/favicon.png',
    },
} satisfies Metadata;

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="vi" data-theme="mytheme">
            <head>
                {/* Script Google SWG */}
                {/* <script async type="application/javascript" src="https://news.google.com/swg/js/v1/swg-basic.js"></script>
        <script>
          {`
            (function() {
              try {
                (self.SWG_BASIC = self.SWG_BASIC || []).push(basicSubscriptions => {
                  basicSubscriptions.init({
                    type: "NewsArticle",
                    isPartOfType: ["Product"],
                    isPartOfProductId: "CAowlNO8DA:openaccess",
                    clientOptions: { theme: "light", lang: "vi" }
                  });
                  // Thêm title cho iframe để cải thiện khả năng tiếp cận
                  const iframe = document.querySelector('iframe[src*="news.google.com"]');
                  if (iframe) {
                    iframe.setAttribute('title', 'Dịch vụ đăng ký Google');
                    }
                    });
                    } catch (error) {
                      console.error('SWG initialization failed:', error);
                      }
                      })();
                      `}
        </script> */}
            </head>
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                {children}
            </body>
        </html>
    );
}
