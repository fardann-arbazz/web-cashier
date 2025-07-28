import { useState, useEffect } from "react";
import { Plus, LayoutGrid, List, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Category } from "@/types/category-type";
import { CategoryStats } from "@/components/dashboard/category/category-stats";
import { CategoryTable } from "@/components/dashboard/category/category-table";
import { CategoryForm } from "@/components/dashboard/category/category-create";
import { UpdateCategory } from "@/components/dashboard/category/update-category";
import { DeleteCategory } from "@/components/dashboard/category/delete-category";
import { useSearchParams } from "react-router-dom";
import CategoryPagination from "@/components/dashboard/category/category-pagination";
import { fetchCategories } from "@/service/api/category-service";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";

export const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1")
  );
  const [pagination, setPagination] = useState({
    current_page: 1,
    limit: 10,
    total: 0,
    total_pages: 1,
  });

  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );

  const debouncedSearch = useDebounce(searchQuery, 500);

  // get data from server
  const fetchCategory = async (page: number = 1, search: string = "") => {
    setIsLoading(true);
    try {
      const res = await fetchCategories(page, search);

      setCategories(res.data);
      setPagination(res.pagination);
      setCurrentPage(res.pagination.current_page);
      setSearchParams((prev) => {
        prev.set("page", res.pagination.current_page.toString());
        return prev;
      });
    } catch (error) {
      console.error("Logging errror", error);
      toast.error("Gagal memuat data category");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategory(1, debouncedSearch);
  }, [debouncedSearch]);

  const stats = {
    total: categories.length,
    recentAdded: categories.slice(0, 3),
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setUpdateModalOpen(true);
  };

  const handleDelete = (category: Category) => {
    setSelectedCategory(category);
    setDeleteModalOpen(true);
  };

  const handlePageChange = (page: number) => {
    fetchCategory(page, searchQuery);
  };

  return (
    <>
      <div className="sm:p-6 space-y-6 mt-12 p-0">
        {/* Header */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="sm:text-2xl text-xl font-bold">
                Category Management
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Organize your products with categories
              </p>
            </div>
            <div className="flex sm:flex-row flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setViewMode(viewMode === "list" ? "grid" : "list")
                }
              >
                {viewMode === "list" ? (
                  <LayoutGrid className="w-4 h-4 mr-2" />
                ) : (
                  <List className="w-4 h-4 mr-2" />
                )}
                {viewMode === "list" ? "Grid View" : "List View"}
              </Button>
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                className="pl-9"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <CategoryStats stats={stats} />

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-12 bg-gray-100 dark:bg-gray-700 rounded"
                  ></div>
                ))}
              </div>
            </div>
          ) : categories.length > 0 ? (
            viewMode === "list" ? (
              <>
                <CategoryTable
                  categories={categories}
                  onEdit={(category) => {
                    handleEdit(category);
                  }}
                  onDelete={(category) => {
                    handleDelete(category);
                  }}
                />
              </>
            ) : (
              <>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {categories.map((category, i) => (
                    <div
                      key={i}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <h3 className="font-medium">{category.title}</h3>
                      <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm">
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )
          ) : (
            <div className="p-12 text-center">
              <div className="space-y-4">
                <Search className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="text-lg font-medium">
                  {searchQuery ? "No categories found" : "No categories yet"}
                </h3>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? `No results for "${searchQuery}"`
                    : "Get started by adding a new category"}
                </p>
                <Button onClick={() => setIsFormOpen(true)} className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Category
                </Button>
              </div>
            </div>
          )}
        </div>

        {categories.length > 0 && (
          <CategoryPagination
            currentPage={currentPage}
            totalPages={pagination.total_pages}
            total={pagination.total}
            limit={pagination.limit}
            onPageChange={handlePageChange}
          />
        )}

        {/* Form Modal */}
        <CategoryForm
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          onSuccess={fetchCategory}
        />
      </div>

      <UpdateCategory
        open={updateModalOpen}
        onOpenChange={setUpdateModalOpen}
        category={selectedCategory}
        onSuccess={fetchCategory}
      />

      <DeleteCategory
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        category={selectedCategory}
        onSuccess={fetchCategory}
      />
    </>
  );
};
