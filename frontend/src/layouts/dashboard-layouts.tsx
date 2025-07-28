import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "@/components/layouts/sidebar";
import Header from "@/components/layouts/header";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? "lg:ml-64" : ""
        }`}
      >
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="p-6">
          <Outlet /> {/* This will render nested routes */}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
