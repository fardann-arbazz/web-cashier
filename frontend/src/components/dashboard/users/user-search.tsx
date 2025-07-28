import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface UserSearchProps {
  searchQuery: string;
  onSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const UserSearch = ({ searchQuery, onSearch }: UserSearchProps) => (
  <div className="flex flex-col sm:flex-row gap-3 pt-4">
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        value={searchQuery}
        onChange={onSearch}
        placeholder="Search users..."
        className="pl-9 h-10 rounded-lg"
      />
    </div>
  </div>
);
