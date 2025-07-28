import { useAuth } from "@/hooks/use-auth";
import {
  Home,
  LibraryIcon,
  MonitorCog,
  NotepadTextDashed,
  Package2,
  ScreenShare,
  Users,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  const { user } = useAuth();

  const sidebarItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
      link: "/dashboard",
      roles: ["admin", "kasir"],
    },
    {
      id: "users",
      label: "Users",
      icon: Users,
      link: "/dashboard/users",
      roles: "admin",
    },
    {
      id: "category",
      label: "Category",
      icon: LibraryIcon,
      link: "/dashboard/category",
      roles: "admin",
    },
    {
      id: "products",
      label: "Products",
      icon: Package2,
      link: "/dashboard/products",
      roles: ["admin", "kasir"],
    },
    {
      id: "transaction",
      label: "Transaction",
      icon: NotepadTextDashed,
      link: "/dashboard/transaction",
      roles: ["admin", "kasir"],
    },
    {
      id: "cashier",
      label: "Cashier",
      icon: ScreenShare,
      link: "/dashboard/cashier",
      roles: ["admin", "kasir"],
    },
  ];

  // Deteksi active tab yang lebih robust
  const activeTab =
    sidebarItems.find(
      (item) =>
        location.pathname === item.link ||
        (item.link !== "/dashboard" && location.pathname.startsWith(item.link))
    )?.id || "dashboard";

  // Efek resize handler
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle body overflow
  useEffect(() => {
    document.body.style.overflow = sidebarOpen && isMobile ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen, isMobile]);

  if (isMobile && !sidebarOpen) return null;

  const filteredSidebarItems = sidebarItems.filter((item) => {
    return item.roles.includes(user?.role || "");
  });

  return (
    <>
      {/* Overlay untuk mobile */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-xl transition-all duration-300 ease-in-out ${
          isMobile
            ? sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
            : "translate-x-0"
        } ${!isMobile ? "hidden sm:block" : ""}`}
      >
        {/* Header sidebar */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <MonitorCog className="w-5 h-5 text-white" />
            </div>
            <span className="sm:text-xl text-base font-bold text-gray-900 dark:text-white">
              InventoryApps
            </span>
          </div>
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Navigation items */}
        <nav className="mt-8 px-4 overflow-y-auto h-[calc(100vh-4rem)]">
          {filteredSidebarItems.map((item, i) => (
            <Link
              to={item.link}
              key={i}
              onClick={() => isMobile && setSidebarOpen(false)}
              className={`flex items-center px-4 py-3 mb-2 rounded-lg transition-colors ${
                activeTab === item.id
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 border-r-2 border-blue-500"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              <p className="text-sm font-medium">{item.label}</p>
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
