import FooterFC from '@/components/userPage/ui/Footer';
import Header from '@/components/userPage/ui/Header';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Header />
      <div className="bg-primary-white">{children}</div>
      <FooterFC />
    </div>
  );
}
