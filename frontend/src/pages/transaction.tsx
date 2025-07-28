import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionTable } from "@/components/dashboard/transaction/transaction-table";
import { TransactionFilters } from "@/components/dashboard/transaction/transaction-filters";
import type { Transaction } from "@/types/transaction-type";
import { useSearchParams } from "react-router-dom";
import { useDebounce } from "@/hooks/use-debounce";
import API from "@/lib/axios";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";
import TransactionPagination from "@/components/dashboard/transaction/transaction-pagination";
import { TransactionLoading } from "@/components/dashboard/transaction/transaction-loading";

const Transaction = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const debouncedSearch = useDebounce(searchQuery, 500);

  const [isLoading, setIsLoading] = useState(false);

  const [expandedTransaction, setExpandedTransaction] = useState<number | null>(
    null
  );

  const [pagination, setPagination] = useState({
    current_page: 1,
    limit: 10,
    total: 0,
    total_pages: 1,
  });
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1")
  );
  const [transaction, setTransaction] = useState<Transaction[]>([]);

  // Call API to get data transactions
  const fetchTransaction = async (page: number = 1, search: string = "") => {
    setIsLoading(true);
    try {
      const res = await API.get("/transaction", {
        params: { page, search },
        headers: {
          Authorization: `Bearer ${useAuthStore.getState().token}`,
        },
      });

      setTransaction(res.data.data);
      setPagination(res.data.pagination);
      setCurrentPage(res.data.pagination.current_page);
      setSearchParams((prev) => {
        prev.set("page", res.data.pagination.current_page.toString());
        return prev;
      });
    } catch (error) {
      toast.error("Gagal memuat data transaction");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransaction(1, debouncedSearch);
  }, [debouncedSearch]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Agu",
      "Sep",
      "Okt",
      "Nov",
      "Des",
    ];
    const day = String(date.getDate()).padStart(2, "0");
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day} ${month} ${year}, ${hours}:${minutes}`;
  };

  const toggleExpandTransaction = (id: number) => {
    setExpandedTransaction(expandedTransaction === id ? null : id);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const handlePageChange = (page: number) => {
    fetchTransaction(page, searchQuery);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto mt-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
            Riwayat Transaksi
          </h1>
          <p className="text-muted-foreground">
            Daftar semua transaksi yang telah dilakukan
          </p>
        </div>

        <TransactionFilters
          searchQuery={searchQuery}
          setSearchQuery={handleSearch}
        />
      </div>

      <Card className="p-0 gap-0">
        <CardHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Daftar Transaksi</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="hidden sm:inline">Total:</span>
              <Badge variant="secondary">{transaction.length} Transaksi</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <TransactionLoading />
          ) : (
            <TransactionTable
              transactions={transaction}
              expandedTransaction={expandedTransaction}
              toggleExpand={toggleExpandTransaction}
              formatDate={formatDate}
            />
          )}
        </CardContent>
      </Card>

      {transaction.length > 0 && (
        <TransactionPagination
          currentPage={currentPage}
          totalPages={pagination.total_pages}
          limit={pagination.limit}
          total={pagination.total}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default Transaction;
