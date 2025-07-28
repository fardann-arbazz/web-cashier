export interface Transaction {
  id: string;
  invoice_number: string;
  creted_at: string;
  cashier: {
    username: string;
  };
  payment_method: string;
  status: string;
  total_amount: number;
  paid_amount: number;
  change_amount: number;
  items: {
    product_id: number;
    product_name: string;
    price: number;
    quantity: number;
    subtotal: number;
  };
}

export interface ApiResponseTrasaction {
  data: Transaction[];
  pagination: {
    current_page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  message: string;
  status: string;
}

export interface TransactionPaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}
