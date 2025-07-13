import { getAllUsedPhoneCatalogs } from '@/services/product-catalog/phoneCatalogService';
import { getAllUsedTabletCatalogs } from '@/services/product-catalog/tabletCatalogService';
import { getAllUsedMacbookCatalogs } from '@/services/product-catalog/macbookCatalogService';
import { getAllUsedWindowsCatalogs } from '@/services/product-catalog/windowsCatalogService';
import ClientUsedProductsPage from './ClientUsedProductsPage';

export default async function UsedPage() {
  const phoneCatalogs = await getAllUsedPhoneCatalogs();
  const tabletCatalogs = await getAllUsedTabletCatalogs();
  const macbookCatalogs = await getAllUsedMacbookCatalogs();
  const windowsCatalogs = await getAllUsedWindowsCatalogs();

  return (
    <ClientUsedProductsPage
      phoneCatalogs={phoneCatalogs}
      tabletCatalogs={tabletCatalogs}
      macbookCatalogs={macbookCatalogs}
      windowsCatalogs={windowsCatalogs}
    />
  );
}