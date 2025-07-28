import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import type { UserPaginationProps } from "@/types/user-type";

export const UserPagination = ({
  currentPage,
  totalPages,
  total,
  limit,
  onPageChange,
}: UserPaginationProps) => (
  <div className="mt-6 flex items-center justify-between">
    <div className="text-sm text-muted-foreground hidden sm:block">
      Showing{" "}
      <span className="font-medium">{(currentPage - 1) * limit + 1}</span> to{" "}
      <span className="font-medium">
        {Math.min(currentPage * limit, total)}
      </span>{" "}
      of <span className="font-medium">{total}</span> users
    </div>
    <Pagination className="flex items-end justify-end">
      <PaginationContent>
        <PaginationItem>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
        </PaginationItem>
        <PaginationItem>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </PaginationItem>

        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNum;
          if (totalPages <= 5) {
            pageNum = i + 1;
          } else if (currentPage <= 3) {
            pageNum = i + 1;
          } else if (currentPage >= totalPages - 2) {
            pageNum = totalPages - 4 + i;
          } else {
            pageNum = currentPage - 2 + i;
          }

          return (
            <PaginationItem key={pageNum}>
              <Button
                variant={currentPage === pageNum ? "outline" : "ghost"}
                size="sm"
                onClick={() => onPageChange(pageNum)}
              >
                {pageNum}
              </Button>
            </PaginationItem>
          );
        })}

        <PaginationItem>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </PaginationItem>
        <PaginationItem>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  </div>
);
