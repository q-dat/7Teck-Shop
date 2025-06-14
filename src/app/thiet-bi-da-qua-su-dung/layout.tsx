import FooterFC from '@/components/UserPage/ui/Footer';
import Header from '@/components/UserPage/ui/Header';
import { Metadata } from 'next';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Header />
      <div className="mt-[80px] px-2 xl:mt-[160px] xl:px-desktop-padding">{children}</div>
      <FooterFC />
    </div>
  );
}