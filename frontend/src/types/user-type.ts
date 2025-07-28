export interface User {
  id: number;
  username: string;
  role: string;
  email?: string;
  password?: string;
  last_active?: string;
}

export interface ApiResponse {
  data: User[];
  pagination: {
    current_page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  message: string;
  status: string;
  total_admin: number;
  total_kasir: number;
}

export interface UserTableProps {
  users: User[];
  currentPage: number;
  limit: number;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export interface UserStatsProps {
  total: number;
  adminCount: number;
  cashierCount: number;
}

export interface UserPaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}
