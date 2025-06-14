import { getAllPhoneCatalogs } from '@/services/product-catalog/phoneCatalogService';
import { getAllTabletCatalogs } from '@/services/product-catalog/tabletCatalogService';
import { getAllMacbookCatalogs } from '@/services/product-catalog/macbookCatalogService';
import { getAllWindowsCatalogs } from '@/services/product-catalog/windowsCatalogService';
import ClientUsedProductsPage from './ClientUsedProductsPage';

export default async function UsedPage() {
  const phoneCatalogs = await getAllPhoneCatalogs();
  const tabletCatalogs = await getAllTabletCatalogs();
  const macbookCatalogs = await getAllMacbookCatalogs();
  const windowsCatalogs = await getAllWindowsCatalogs();

  return (
    <ClientUsedProductsPage
      phoneCatalogs={phoneCatalogs}
      tabletCatalogs={tabletCatalogs}
      macbookCatalogs={macbookCatalogs}
      windowsCatalogs={windowsCatalogs}
    />
  );
}