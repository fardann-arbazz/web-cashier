import { Tag, PlusCircle } from "lucide-react";
import type { Category } from "../../../types/category-type";

interface CategoryStatsProps {
  stats: {
    total: number;
    recentAdded?: Category[];
  };
}
    
export const CategoryStats = ({ stats }: CategoryStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Categories</p>
            <h3 className="text-2xl font-bold">{stats.total}</h3>
          </div>
          <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-900/20">
            <Tag className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </div>

      {stats.recentAdded && stats.recentAdded.length > 0 && (
        <div className="md:col-span-3 bg-white dark:bg-gray-800 rounded-lg border p-4 shadow-sm">
          <h4 className="font-medium mb-3">Recently Added</h4>
          <div className="flex flex-wrap gap-2">
            {stats.recentAdded.map((category) => (
              <span
                key={category.id}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700"
              >
                <PlusCircle className="w-4 h-4 mr-1.5 text-green-500" />
                {category.title}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
