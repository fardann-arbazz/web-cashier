import { Box, Package, AlertTriangle, Layers } from "lucide-react";

interface ProductStatsProps {
  stats: {
    totalProducts: number;
    totalStock: number;
    lowStockItems: number;
    categoriesCount: number;
  };
}

export const ProductStats = ({ stats }: ProductStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Products */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Products</p>
            <h3 className="text-2xl font-bold">{stats.totalProducts}</h3>
          </div>
          <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-900/20">
            <Box className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </div>

      {/* Total Stock */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Stock</p>
            <h3 className="text-2xl font-bold">{stats.totalStock}</h3>
          </div>
          <div className="p-3 rounded-full bg-green-50 dark:bg-green-900/20">
            <Package className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </div>

      {/* Low Stock Items */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Low Stock Items</p>
            <h3 className="text-2xl font-bold">{stats.lowStockItems}</h3>
          </div>
          <div className="p-3 rounded-full bg-orange-50 dark:bg-orange-900/20">
            <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Categories</p>
            <h3 className="text-2xl font-bold">{stats.categoriesCount}</h3>
          </div>
          <div className="p-3 rounded-full bg-purple-50 dark:bg-purple-900/20">
            <Layers className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </div>
    </div>
  );
};
