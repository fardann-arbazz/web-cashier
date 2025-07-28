export interface Category {
  id: number;
  title: string;
}

export interface CategoryStats {
  total: number;
  recentAdded?: Category[];
}

export interface ApiResponse {
  data: Category[];
  pagination: {
    current_page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  message: string;
  status: string;
}

export interface CategoryPaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}
