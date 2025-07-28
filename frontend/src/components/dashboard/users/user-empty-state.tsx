import { Users2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserEmptyStateProps {
  searchQuery: string;
  onClearSearch: () => void;
}

export const UserEmptyState = ({
  searchQuery,
  onClearSearch,
}: UserEmptyStateProps) => (
  <div className="p-12 text-center">
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="p-4 rounded-full bg-blue-50 dark:bg-blue-900/20">
        <Users2 className="h-12 w-12 text-blue-500" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-medium">
          {searchQuery ? "No users found" : "No users registered"}
        </h3>
        <p className="text-sm text-muted-foreground max-w-md">
          {searchQuery
            ? `No users match your search for "${searchQuery}". Try adjusting your search terms.`
            : "There are currently no users registered in the system. Start by adding a new user."}
        </p>
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSearch}
            className="mt-4"
          >
            Clear search
          </Button>
        )}
      </div>
    </div>
  </div>
);
