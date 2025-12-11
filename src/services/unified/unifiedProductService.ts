import { getPhoneWithFallback } from '../products/phoneService';
import { getMacbookWithFallback } from '../products/macbookService';
import { getTabletWithFallback } from '../products/tabletService';
import { getWindowsWithFallback } from '../products/windowsService';

import { generatePhoneMetadata } from '@/metadata/id/phoneMetadata';
import { generateMacbookMetadata } from '@/metadata/id/macbookMetadata';
import { generateTabletMetadata } from '@/metadata/id/tabletMetadata';
import { generateWindowsMetadata } from '@/metadata/id/windowsMetadata';

import { slugify } from '@/utils/slugify';

export async function detectProductType(id: string) {
  const phone = await getPhoneWithFallback(id);
  if (phone) {
    return {
      type: 'phone' as const,
      product: phone,
      metadata: generatePhoneMetadata(phone),
      jsonLd: {
        '@context': 'https://schema.org/',
        '@type': 'Product',
        name: phone.name,
        image: phone.img,
        description: phone.des || `Apple - ${phone.name} tại 7Teck`,
        sku: phone._id,
        brand: {
          '@type': 'Brand',
          name: 'Apple',
        },
        offers: {
          '@type': 'Offer',
          url: `${process.env.NEXT_PUBLIC_SITE_URL}/${slugify(phone.name)}/${phone._id}`,
          priceCurrency: 'VND',
          price: phone.price.toString(),
          availability: 'https://schema.org/InStock',
        },
      },
    };
  }

  const mac = await getMacbookWithFallback(id);
  if (mac) {
    return {
      type: 'macbook' as const,
      product: mac,
      metadata: generateMacbookMetadata(mac),
      jsonLd: {
        '@context': 'https://schema.org/',
        '@type': 'Product',
        name: mac.macbook_name,
        image: mac.macbook_img,
        description: mac.macbook_des || `Apple - ${mac.macbook_name} tại 7Teck`,
        sku: mac._id,
        brand: {
          '@type': 'Brand',
          name: 'Apple',
        },
        offers: {
          '@type': 'Offer',
          url: `${process.env.NEXT_PUBLIC_SITE_URL}/${slugify(mac.macbook_name)}/${mac._id}`,
          priceCurrency: 'VND',
          price: mac.macbook_price.toString(),
          availability: 'https://schema.org/InStock',
        },
      },
    };
  }

  const tablet = await getTabletWithFallback(id);
  if (tablet) {
    return {
      type: 'tablet' as const,
      product: tablet,
      metadata: generateTabletMetadata(tablet),
      jsonLd: {
        '@context': 'https://schema.org/',
        '@type': 'Product',
        name: tablet.tablet_name,
        image: tablet.tablet_img,
        description: tablet.tablet_des || `Apple - ${tablet.tablet_name} tại 7Teck`,
        sku: tablet._id,
        brand: {
          '@type': 'Brand',
          name: 'Apple',
        },
        offers: {
          '@type': 'Offer',
          url: `${process.env.NEXT_PUBLIC_SITE_URL}/${slugify(tablet.tablet_name)}/${tablet._id}`,
          priceCurrency: 'VND',
          price: tablet.tablet_price.toString(),
          availability: 'https://schema.org/InStock',
        },
      },
    };
  }

  const win = await getWindowsWithFallback(id);
  if (win) {
    return {
      type: 'windows' as const,
      product: win,
      metadata: generateWindowsMetadata(win),
      jsonLd: {
        '@context': 'https://schema.org/',
        '@type': 'Product',
        name: win.windows_name,
        image: win.windows_img,
        description: win.windows_des || `Apple - ${win.windows_name} tại 7Teck`,
        sku: win._id,
        brand: {
          '@type': 'Brand',
          name: 'Apple',
        },
        offers: {
          '@type': 'Offer',
          url: `${process.env.NEXT_PUBLIC_SITE_URL}/windows/${slugify(win.windows_name)}/${win._id}`,
          priceCurrency: 'VND',
          price: win.windows_price.toString(),
          availability: 'https://schema.org/InStock',
        },
      },
    };
  }

  return null;
}
