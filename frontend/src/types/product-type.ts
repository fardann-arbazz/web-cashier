export interface Product {
  id: string;
  nama: string;
  harga: number;
  stok: number;
  category_id: number;
  category_title?: string;
}

export interface ProductStats {
  totalProducts: number;
  totalStock: number;
  lowStockItems: number;
  categoriesCount: number;
}

export interface ApiResponse {
  data: Product[];
  pagination: {
    current_page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  message: string;
  status: string;
}

export interface ProductPaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}
