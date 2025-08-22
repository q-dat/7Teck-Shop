export interface IProductVariant {
  _id?: string;
  name: string;
  price_new: number | null; // Allow null to match data (e.g., iPhone 13 Mini 128G)
  price_used: number | null; // Allow null to match data
  condition: string;
  storage?: string;
}

export interface IProductGroup {
  catalog: string;
  variants: IProductVariant[];
}

// API Response
export interface IPriceListApi {
  _id: string;
  category: string;
  price_new: number | null; // Allow null to match data (e.g., iPhone 13 Series)
  price_used: number | null; // Allow null to match data
  conditions?: string;
  groups: IProductGroup[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ICreatePriceListPayload {
  category: string;
  price_new: number | null; // Allow null for consistency
  price_used: number | null; // Allow null for consistency
  conditions?: string;
  groups: IProductGroup[];
}

export interface FormValues {
  category: string;
  catalog: string;
  conditions: string;
  variants: Array<{
    name: string;
    price_new: number | null; // Allow null to match IProductVariant
    price_used: number | null; // Allow null to match IProductVariant
    storage?: string;
    condition: string;
  }>;
}