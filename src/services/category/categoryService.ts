import { api } from '../api/client';
import { endpoints } from '../api/endpoints';

export interface CategoryPayloadCategory {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
}

export interface CategoryPayloadSubCategory {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
}

export interface CategoryPayloadBanner {
  id: string;
  imageUrl: string;
  link: string | null;
  title: string | null;
}

export interface CategoryPayloadProductVariant {
  id: string;
  size: string;
  price: number;
  originalPrice?: number;
}

export interface CategoryPayloadProduct {
  id: string;
  name: string;
  images: string[];
  price: number;
  originalPrice?: number;
  discount?: string;
  quantity: string;
  variants: CategoryPayloadProductVariant[];
}

export interface CategoryPayloadData {
  category: CategoryPayloadCategory;
  subcategories: CategoryPayloadSubCategory[];
  banners: CategoryPayloadBanner[];
  products: CategoryPayloadProduct[];
}

export interface CategoryPayloadResponse {
  success: boolean;
  data: CategoryPayloadData;
}

export const categoryService = {
  getCategoryPayload: async (
    categoryId: string,
    subCategoryId?: string | null
  ): Promise<CategoryPayloadResponse> => {
    const url = endpoints.categories.detail(categoryId);
    const params = subCategoryId ? { subCategoryId } : undefined;
    return api.get<CategoryPayloadData>(url, { params }) as Promise<CategoryPayloadResponse>;
  },
};

export default categoryService;
