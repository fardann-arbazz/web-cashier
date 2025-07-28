import API from "@/lib/axios";
import { useAuthStore } from "@/stores/auth-store";
import type { Category } from "@/types/category-type";

export const fetchCategories = async (
  page: number = 1,
  search: string = ""
): Promise<{
  data: Category[];
  pagination: {
    current_page: number;
    total_pages: number;
    total: number;
    limit: number;
  };
}> => {
  const res = await API.get("/categories", {
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
