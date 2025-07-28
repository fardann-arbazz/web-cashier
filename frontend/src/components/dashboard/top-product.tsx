import { Package, MoreHorizontal } from "lucide-react";

interface Product {
  name: string;
  sales: number;
  revenue: string;
  change: string;
}

interface TopProductsProps {
  products: Product[];
}

const TopProducts = ({ products }: TopProductsProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Top Products
        </h3>
        <div className="flex items-center space-x-2">
          <button className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline">
            View all
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                Product
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                Sales
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                Revenue
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                Change
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr
                key={index}
                className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded flex items-center justify-center">
                      <Package className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {product.name}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4 text-sm text-gray-700 dark:text-gray-300">
                  {product.sales.toLocaleString()}
                </td>
                <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                  {product.revenue}
                </td>
                <td className="py-4 px-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    {product.change}
                  </span>
                </td>
                <td className="py-4 px-4 text-right">
                  <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                    <MoreHorizontal className="w-4 h-4 text-gray-500" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopProducts;
