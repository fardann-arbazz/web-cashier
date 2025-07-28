import type { UserStatsProps } from "@/types/user-type";
import { Users2, Shield, UserCog } from "lucide-react";

export const UserStats = ({
  total,
  adminCount,
  cashierCount,
}: UserStatsProps) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Total Users</p>
          <h3 className="text-2xl font-bold">{total}</h3>
        </div>
        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
          <Users2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
      </div>
    </div>
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Admins</p>
          <h3 className="text-2xl font-bold">{adminCount}</h3>
        </div>
        <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
          <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </div>
      </div>
    </div>
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Cashiers</p>
          <h3 className="text-2xl font-bold">{cashierCount}</h3>
        </div>
        <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
          <UserCog className="w-5 h-5 text-green-600 dark:text-green-400" />
        </div>
      </div>
    </div>
  </div>
);
