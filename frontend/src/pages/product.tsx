import { useState, useEffect } from "react";
import { Plus, Box, Search } from "lucide-react";
import type { Product } from "@/types/product-type";
import { Button } from "@/components/ui/button";
import { ProductStats } from "@/components/dashboard/product/product-stats";
import { ProductTable } from "@/components/dashboard/product/product-table";
import { Link, useSearchParams } from "react-router-dom";
import ProductPagination from "@/components/dashboard/product/product-pagination";
import { Input } from "@/components/ui/input";
import UpdateProductDialog from "@/components/dashboard/product/update-product";
import DeleteProductDialog from "@/components/dashboard/product/delete-product";
import { fetchProdutcsService } from "@/service/api/product-service";
import { useDebounce } from "@/hooks/use-debounce";
import { useAuth } from "@/hooks/use-auth";

export const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [modalUpdate, setModalUpdate] = useState(false);
  const [modalDelete, setModalDelete] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
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

  const debouncedSearch = useDebounce(searchQuery, 500);
  const { user } = useAuth();

  // fetching data barang or products
  const fetchProducts = async (page: number = 1, search: string = "") => {
    setIsLoading(true);
    try {
      const res = await fetchProdutcsService(page, search);

      setProducts(res.data);
      setPagination(res.pagination);
      setCurrentPage(res.pagination.current_page);
      setSearchParams((prev) => {
        prev.set("page", res.pagination.current_page.toString());
        return prev;
      });
    } catch (error) {
      console.log("error response", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(1, debouncedSearch);
  }, [debouncedSearch]);

  const stats = {
    totalProducts: pagination.total,
    totalStock: products.reduce((sum, product) => sum + product.stok, 0),
    lowStockItems: products.filter((p) => p.stok < 5).length,
    categoriesCount: [...new Set(products.map((p) => p.category_id))].length,
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handlePageChange = (page: number) => {
    fetchProducts(page);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setModalUpdate(true);
  };

  const handleDelete = (product: Product) => {
    setSelectedProduct(product);
    setModalDelete(true);
  };

  return (
    <div className="sm:p-6 space-y-6 mt-12 p-0">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Product Management</h1>
          <p className="text-muted-foreground">
            Manage your inventory and products
          </p>
        </div>
        {user?.role == "admin" && (
          <Link to={"/dashboard/products/create"}>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </Link>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-9"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <ProductStats stats={stats} />

      {/* Main Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-16 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"
              ></div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <ProductTable
            user={user}
            currentPage={currentPage}
            perPage={pagination.limit}
            products={products}
            onEdit={(products) => handleEdit(products)}
            onDelete={(products) => handleDelete(products)}
          />
        ) : (
          <div className="p-12 text-center">
            <Box className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No products yet</h3>
            <p className="mt-2 text-muted-foreground">
              Get started by adding your first product
            </p>
            <Button className="mt-6">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>
        )}
      </div>

      {products.length > 0 && (
        <ProductPagination
          currentPage={currentPage}
          totalPages={pagination.total_pages}
          total={pagination.total}
          limit={pagination.limit}
          onPageChange={handlePageChange}
        />
      )}

      <UpdateProductDialog
        product={selectedProduct}
        open={modalUpdate}
        onOpenChange={setModalUpdate}
        onSuccess={fetchProducts}
      />

      <DeleteProductDialog
        product={selectedProduct}
        open={modalDelete}
        onOpenChange={setModalDelete}
        onSuccess={fetchProducts}
      />
    </div>
  );
};
