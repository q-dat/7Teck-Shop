'use client';
import ClientUsedProductByCatalogPage from '@/components/userPage/page/ClientUsedProductByCatalogPage';
import { IWindows } from '@/types/type/windows/windows';

export default function UsedWindowsPage({ windows }: { windows: IWindows[] }) {
  return (
    <ClientUsedProductByCatalogPage
      title="Laptop Windows"
      data={windows}
      getName={(p) => p.windows_name}
      getImage={(p) => p.windows_img}
      getPrice={(p) => p.windows_price}
      getSale={(p) => p.windows_sale ?? null}
      getView={(p) => p.windows_view ?? 0}
      getStatus={(p) => p.windows_status ?? null}
      getId={(p) => p._id}
      buildLink={(slug, id) => `/laptop-windows/${slug}/${id}`}
    />
  );
}
