import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { User, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui";
import { APP_NAME } from "@/utils/constants";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/utils/cn";
import { scrollToTop } from "@/utils/common";
import { trackMenuNavigation } from "@/utils/ga";
import { setCookie } from "@/utils/myra";
import { apiClient } from "../../services/api";

// eslint-disable-next-line react-refresh/only-export-components
export const navigationRoutes = [
  { name: "Home", path: "/home", requiresPage: "Home" },
  { name: "Data Center", path: "/assets", requiresPage: "Data Center" },
  // { name: "IT Load", path: "/it-load", requiresPage: "IT Load" },
  { name: "Companies", path: "/companies", requiresPage: "Companies" },
  // { name: "Analytics", path: "/analytics", requiresPage: "Analytics" },
  ...(import.meta.env.VITE_NODE_ENV === 'production' ? [] : [{ name: "Companies Intelligence", path: "/companies-intelligence", requiresPage: "Companies Intelligence" }]),
  { name: "Location Intelligence", path: "/location-intelligence", requiresPage: "Location Intelligence" },
  // { name: "News", path: "/news", requiresPage: "News" },
  { name: "Signals", path: "/signals", requiresPage: "News" },
  { name: "Reports", path: "/reports", requiresPage: "Reports" },
  { name: "Ask Analyst", path: "/ask-analyst", requiresPage: "Ask Analyst" },
  { name: "Ask DCX AI", path: "/dcx-ai", requiresPage: "DCX AI" },
];

export const Header: React.FC = () => {
  const location = useLocation();
  const { logout, setMobileNavbarOpen } = useAuthStore((state) => state);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const user = useAuthStore((state) => state.user);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setMobileNavbarOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    scrollToTop();
    setIsMobileMenuOpen(false);
    setMobileNavbarOpen(false);
  };

  const handleNavClick = (itemName: string, itemPath: string) => {
    if (user) {
      trackMenuNavigation(itemName, itemPath, user.email);
    }
    scrollToTop();
  };

  const navigationItems = navigationRoutes.filter((item) => {
    // Filter navigation items based on user permissions
    // if (!user) return false;
    // if (item.requiresPage && !user.allowedPages.includes(item.requiresPage)) {
    //   return false;
    // }
    return true;
  });
  
  
  async function authenticateProdgain() {
  apiClient.post("/users/authenticate-prodgain", {})
  .then((res) => {
    const authToken = res.data.authToken;
    const email = res.data.email;
    setCookie("accessToken", authToken, 24);
    setCookie("email", email, 24);
  })
  .catch((error) => {
    console.error("Error during authentication:", error);
  });
}

useEffect(() => {
  authenticateProdgain();
}, []);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-100">
      <div className="max-w-container mx-auto px-2 lg:px-4 min-w-0">
        <div className="flex justify-between items-center h-16 gap-2 min-w-0">
          {/* Logo */}
          <div className="flex items-center shrink-0">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-12 h-8 sm:w-10 sm:h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <img
                  src="/Logo.png"
                  alt="Logo"
                  className="w-full h-full sm:h-6"
                />
              </div>
              <span className="min-[1400px]:inline text-sm xl:text-lg font-semibold text-gray-900 hidden whitespace-nowrap">
                {APP_NAME}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation — flex-1 + scroll prevents tab overflow on lg / tablet widths */}
          <nav className="hidden lg:flex flex-1 min-w-0 justify-center gap-1.5 xl:gap-3 2xl:gap-6 h-full overflow-x-auto overflow-y-hidden no-print [scrollbar-width:thin]">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                title={item.name}
                onClick={() => handleNavClick(item.name, item.path)}
                className={cn(
                  "px-2 xl:px-3 py-2 text-[14px] font-medium rounded-md transition-colors flex items-center whitespace-nowrap",
                  location.pathname === item.path ||
                    location.pathname.startsWith(item.path + "/")
                    ? "text-primary-600 bg-primary-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
                id={item.requiresPage === "DCX AI" ? "myra-btn" : ""}
                style={
                  location.pathname === item.path ||
                  location.pathname.startsWith(item.path + "/")
                    ? { borderBottom: "2px solid #000", borderRadius: 0 }
                    : {}
                }
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-3 no-print shrink-0">
            <div className="flex items-center space-x-2">
              <Link to="/profile" title="Profile">
                <Button variant="ghost" size="sm" className="p-2">
                  <User className="w-5 h-5" />
                </Button>
              </Link>

              <Button
                variant="ghost"
                size="sm"
                className="p-2 text-red-600 hover:bg-red-50"
                onClick={handleLogout}
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center space-x-2 no-print">
            <Link to="/profile" className="lg:hidden">
              <Button variant="ghost" size="sm" className="p-2">
                <User className="w-5 h-5" />
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="sm"
              className="p-2"
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div
          className={cn(
            "lg:hidden absolute top-full left-0 right-0 z-50 bg-white shadow-lg border-b border-gray-200 transition-all duration-300 ease-in-out no-print",
            isMobileMenuOpen
              ? "translate-y-0 opacity-100 pointer-events-auto"
              : "-translate-y-full opacity-0 pointer-events-none"
          )}
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => {
                  handleNavClick(item.name, item.path);
                  closeMobileMenu();
                }}
                className={cn(
                  "block px-3 py-2 text-base font-medium rounded-md transition-colors",
                  location.pathname === item.path
                    ? "text-primary-600 bg-primary-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                {item.name}
              </Link>
            ))}

            {/* Mobile Logout Button */}
            <div className="pt-2 border-t border-gray-200">
              <Button
                variant="ghost"
                className="w-full justify-start px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50"
                onClick={() => {
                  handleLogout();
                  closeMobileMenu();
                }}
              >
                <LogOut className="w-5 h-5 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
