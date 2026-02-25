import { IPhoneCatalog } from '../../catalogs/phone-catalog/phone-catalog';

export interface IPhone {
  _id: string;
  phone_catalog_id: IPhoneCatalog;
  view?: number;
  name: string;
  color: string;
  img: string;
  thumbnail?: string[];
  price: number;
  sale: number; // ?
  status: string;
  des?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}
export interface GroupedPhone {
  catalog: IPhoneCatalog;
  variants: IPhone[];
}
export interface PhoneFilterParams {
  status?: string;
  name?: string;
  minPrice?: string;
  maxPrice?: string;
  color?: string;
  ram?: string;
  storage?: string;
  sort?: 'price_asc' | 'price_desc' | 'newest';
}
