import type { Metadata } from 'next';

export const metadata = {
  title: {
    absolute: '7Teck.vn',
  },
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
    },
  },
} satisfies Metadata;

interface LocalProductsPageLayoutProps {
  children: React.ReactNode;
}

export default function LocalProductsPageLayout({
  children,
}: LocalProductsPageLayoutProps) {
  return children;
}