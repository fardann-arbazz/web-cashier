import API from "@/lib/axios";
import { useAuthStore } from "@/stores/auth-store";
import type { Product } from "@/types/product-type";

export const fetchProdutcsService = async (
  page: number = 1,
  search: string = ""
): Promise<{
  data: Product[];
  pagination: {
    current_page: number;
    total_pages: number;
    total: number;
    limit: number;
  };
}> => {
  const res = await API.get("/barang", {
    params: { page, search },
    headers: {
      Authorization: `Bearer ${useAuthStore.getState().token}`,
    },
  });

  return {
    data: res.data.data,
    pagination: res.data.pagination,
  };
};
