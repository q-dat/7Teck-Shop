'use client';
import ClientUsedProductByCatalogPage from '@/components/userPage/page/ClientUsedProductByCatalogPage';
import { IMacbook } from '@/types/type/macbook/macbook';

export default function UsedMacbookPage({ macbook }: { macbook: IMacbook[] }) {
  return (
    <ClientUsedProductByCatalogPage
      title="Macbook"
      data={macbook}
      getName={(p) => p.macbook_name}
      getImage={(p) => p.macbook_img}
      getPrice={(p) => p.macbook_price}
      getSale={(p) => p.macbook_sale ?? null}
      getView={(p) => p.macbook_view ?? 0}
      getStatus={(p) => p.macbook_status ?? null}
      getId={(p) => p._id}
      buildLink={(slug, id) => `/macbook/${slug}/${id}`}
    />
  );
}
