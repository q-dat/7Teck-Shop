export interface UsedProduct {
  _id: string;
  name: string;
  slug: string;
  sourceProductId?: string | null;
  description?: string;
  price: number;
  priceText?: string;
  category: string;
  categorySlug: string | null;
  parentCategory: string | null;
  parentCategorySlug: string | null;
  images: unknown[];
  status?: string;
  pin?: string;
  isDone?: boolean;
  doneAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface UsedProductCategory {
  name: string;
  slug: string;
  count: number;
  products: UsedProduct[];
}
