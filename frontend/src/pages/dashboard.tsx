import React, { useEffect } from "react";
import { Users, TrendingUp, DollarSign, ShoppingCart } from "lucide-react";
import StatsCard from "@/components/dashboard/stats-card";
import RevenueChart from "@/components/dashboard/revenue-chart";
import RecentActivities from "@/components/dashboard/recent-activity";
import TopProducts from "@/components/dashboard/top-product";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, []);

  // Sample data
  const stats = [
    {
      title: "Total Revenue",
      value: "$45,231.89",
      change: "+20.1%",
      trend: "up" as const,
      icon: DollarSign,
      color: "bg-blue-500",
    },
    {
      title: "Active Users",
      value: "2,350",
      change: "+180.1%",
      trend: "up" as const,
      icon: Users,
      color: "bg-green-500",
    },
    {
      title: "Sales",
      value: "+12,234",
      change: "+19%",
      trend: "up" as const,
      icon: ShoppingCart,
      color: "bg-purple-500",
    },
    {
      title: "Conversion Rate",
      value: "3.24%",
      change: "-4.3%",
      trend: "down" as const,
      icon: TrendingUp,
      color: "bg-orange-500",
    },
  ];

  const recentActivities = [
    {
      id: 1,
      user: "Sarah Johnson",
      action: "completed purchase",
      time: "2 min ago",
      avatar: "SJ",
    },
    {
      id: 2,
      user: "Mike Chen",
      action: "signed up",
      time: "5 min ago",
      avatar: "MC",
    },
    {
      id: 3,
      user: "Emma Davis",
      action: "left review",
      time: "10 min ago",
      avatar: "ED",
    },
    {
      id: 4,
      user: "Alex Brown",
      action: "updated profile",
      time: "15 min ago",
      avatar: "AB",
    },
  ];

  const topProducts = [
    {
      name: "Wireless Headphones",
      sales: 1234,
      revenue: "$24,680",
      change: "+12%",
    },
    { name: "Smart Watch", sales: 987, revenue: "$19,740", change: "+8%" },
    { name: "Laptop Stand", sales: 654, revenue: "$13,080", change: "+15%" },
    { name: "USB-C Hub", sales: 432, revenue: "$8,640", change: "+5%" },
  ];

  return (
    <>
      <div className="mt-16">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatsCard key={index} stat={stat} />
          ))}
        </div>

        <TopProducts products={topProducts} />
      </div>
    </>
  );
};

export default Dashboard;
