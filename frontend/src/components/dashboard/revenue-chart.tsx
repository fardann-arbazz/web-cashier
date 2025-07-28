import { Filter, Download } from "lucide-react";

const RevenueChart = () => {
  return (
    <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Revenue Overview
        </h3>
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <Filter className="w-4 h-4 text-gray-500" />
          </button>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <Download className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Simplified Chart Representation */}
      <div className="h-64 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg flex items-end justify-center p-4">
        <div className="flex items-end space-x-2 h-full w-full max-w-md">
          {[40, 65, 45, 80, 55, 70, 85, 60, 75, 90, 65, 95].map((height, i) => (
            <div
              key={i}
              className="bg-gradient-to-t from-blue-500 to-purple-500 rounded-t flex-1 transition-all duration-1000 hover:opacity-80"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 text-sm text-gray-600 dark:text-gray-400">
        <span>Jan</span>
        <span>Dec</span>
      </div>
    </div>
  );
};

export default RevenueChart;
