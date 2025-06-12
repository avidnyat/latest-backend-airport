
import { useState, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Users,
  Menu,
  X,
  LogOut,
} from "lucide-react";

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  active?: boolean;
}

const SidebarItem = ({ icon: Icon, label, href, active }: SidebarItemProps) => {
  return (
    <Link to={href}>
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-2 mb-1",
          active && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
        )}
      >
        <Icon className="h-5 w-5" />
        {label}
      </Button>
    </Link>
  );
};

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const pathname = location.pathname;

  // Use useCallback to prevent unnecessary re-renders
  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);
  
  // Function to close the sidebar when clicked outside on mobile
  const handleBackdropClick = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const handleSignOut = useCallback(async () => {
    await signOut();
    navigate("/");
  }, [signOut, navigate]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleSidebar}
          className="bg-white"
        >
          {sidebarOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transition-all duration-300 transform bg-white border-r shadow-sm lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center mb-8">
            <img 
              src="/lovable-uploads/2cc41b34-9e58-4f50-b7cc-351430d7b11f.png" 
              alt="First Capital Bank" 
              className="h-12 w-auto object-contain"
            />
          </div>

          <nav className="space-y-1 flex-1">
            <SidebarItem
              icon={LayoutDashboard}
              label="Dashboard"
              href="/dashboard"
              active={pathname === "/dashboard"}
            />
            <SidebarItem
              icon={Users}
              label="Customers"
              href="/customers"
              active={pathname === "/customers" || pathname.startsWith("/customers/")}
            />
          </nav>

          {/* Sign Out Button at bottom of sidebar */}
          <div className="mt-auto pt-4 border-t">
            <Button
              variant="outline"
              className="w-full justify-start gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm py-4 px-6 flex items-center justify-between">
          <div className="flex items-center">
            {pathname === "/dashboard" ? (
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-800">FCB AirLounge Access System</h1>
              </div>
            ) : (
              <h2 className="text-lg font-medium text-gray-800">
                {pathname === "/customers" ? "Customers" :
                 pathname.startsWith("/customers/card/") ? "Membership Card" :
                 pathname.startsWith("/customers/edit/") ? "Edit Customer" : 
                 pathname === "/customers/new" ? "New Customer" : ""}
              </h2>
            )}
          </div>
          
          {/* Header Sign Out Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </header>
        
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>

      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={handleBackdropClick}
        />
      )}
    </div>
  );
};

export default Layout;
