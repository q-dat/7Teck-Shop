import { ToastContainer } from 'react-toastify';
import ErrorBoundary from '@/components/orther/error/ErrorBoundary';
import ScrollToTopButton from '@/components/orther/scrollToTop/ScrollToTopButton';
import ContactForm from '@/components/userPage/ContactForm';
import NavBottom from '@/components/userPage/NavBottom';
import FooterFC from '@/components/userPage/ui/Footer';
import Header from '@/components/userPage/ui/Header';
// import NotificationPopup from '@/components/userPage/NotificationPopup';
import { PreloadSearch } from '@/components/userPage/PreloadSearch';
import CustomCursor from '@/components/userPage/CustomCursor';

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ErrorBoundary>
      <CustomCursor />
      <ToastContainer style={{ marginTop: '50px' }} />
      <div className="flex min-h-screen flex-col bg-primary-white xl:pt-[130px]">
        <Header />
        <div className="flex-1 bg-primary-white selection:bg-primary selection:text-white xl:pt-0">{children}</div>
        {/* <NotificationPopup /> */}
        <PreloadSearch query="gb" />
        <ScrollToTopButton />
        <NavBottom />
        <ContactForm />
        <FooterFC />
      </div>
    </ErrorBoundary>
  );
}
