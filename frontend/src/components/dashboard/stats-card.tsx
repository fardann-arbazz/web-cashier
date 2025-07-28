import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface Stat {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface StatsCardProps {
  stat: Stat;
}

const StatsCard = ({ stat }: StatsCardProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            {stat.title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stat.value}
          </p>
          <div className="flex items-center mt-2">
            {stat.trend === "up" ? (
              <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
            )}
            <span
              className={`text-sm font-medium ${
                stat.trend === "up" ? "text-green-600" : "text-red-600"
              }`}
            >
              {stat.change}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
              vs last month
            </span>
          </div>
        </div>
        <div
          className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}
        >
          <stat.icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
