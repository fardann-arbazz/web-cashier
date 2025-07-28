import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface TransactionFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}

export const TransactionFilters = ({
  searchQuery,
  setSearchQuery,
}: TransactionFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative w-full sm:w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari transaksi..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    </div>
  );
};
