export interface JsonLdProduct extends Record<string, unknown> {
  '@context': 'https://schema.org/';
  '@type': 'Product';
  name: string;
  image: string;
  description: string;
  sku: string;
  brand?: JsonLdBrand;
  offers: JsonLdOffer;
}

export interface JsonLdOffer {
  '@type': 'Offer';
  url: string;
  priceCurrency: string;
  price: string | number;
  availability?: string;
}

export interface JsonLdBrand {
  '@type': 'Brand';
  name: string;
}
