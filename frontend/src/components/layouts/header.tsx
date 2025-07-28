import ProfileDropdown from "@/components/dashboard/profile-dropdown";

import { Search, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Header = ({ sidebarOpen, setSidebarOpen }: HeaderProps) => {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  //   const [darkMode, setDarkMode] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  //   // Toggle dark mode
  //   const toggleDarkMode = () => {
  //     setDarkMode(!darkMode);
  //     document.documentElement.classList.toggle("dark");
  //   };

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 shadow-sm transition-all duration-300 ${
        scrolled
          ? "shadow-lg dark:shadow-gray-900/50"
          : "border-b border-gray-200 dark:border-gray-700"
      }`}
    >
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        {/* Left section - Menu button and title */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>

          <h1 className="text-xl font-bold text-gray-900 dark:text-white whitespace-nowrap">
            Dashboard<span className="text-blue-500">.</span>
          </h1>
        </div>

        {/* Mobile search (shown only when active) */}
        {isMobileSearchOpen && (
          <div className="absolute inset-x-0 top-0 h-full bg-white dark:bg-gray-800 px-4 flex items-center z-50">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                autoFocus
                className="w-full pl-10 pr-12 py-2 border-0 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
              />
              <button
                onClick={() => setIsMobileSearchOpen(false)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Right section - Icons and profile */}
        <div className="flex items-center">
          {/* Mobile search button (hidden on desktop) */}

          {/* Dark mode toggle */}
          {/* <button
            onClick={toggleDarkMode}
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button> */}

          {/* Profile */}
          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
};

export default Header;
