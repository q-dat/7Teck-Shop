export const revalidate = 18000;
import { getPhoneWithFallback } from '@/services/products/phoneService';
import { IPhone } from '@/types/type/products/phone/phone';
import ClientPhoneDetailPage from './ClientPhoneDetailPage';

type RouteParams = {
  slug?: string;
  id: string;
};

export default async function PhoneDetailPage({ params }: { params: Promise<RouteParams> }) {
  const { id } = await params;

  const phone: IPhone | null = await getPhoneWithFallback(id);

  if (!phone) {
    return <div className="mt-10 text-center">Không có dữ liệu.</div>;
  }

  return (
    <>
      <ClientPhoneDetailPage phone={phone} />
    </>
  );
}
