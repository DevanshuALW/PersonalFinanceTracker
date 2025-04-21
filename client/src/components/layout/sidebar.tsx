import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    if (confirm("Are you sure you want to sign out?")) {
      logoutMutation.mutate();
    }
  };

  const navItems = [
    { path: "/", label: "Dashboard", icon: "ri-dashboard-line" },
    { path: "/transactions", label: "Transactions", icon: "ri-exchange-dollar-line" },
    { path: "/savings", label: "Savings Goals", icon: "ri-money-dollar-box-line" },
  ];

  return (
    <aside 
      className={cn(
        "lg:translate-x-0 fixed lg:static inset-y-0 left-0 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 flex flex-col",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="p-5 border-b flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-md bg-primary-600 flex items-center justify-center">
            <i className="ri-line-chart-line text-white text-xl"></i>
          </div>
          <h2 className="ml-3 text-xl font-bold text-gray-800">FinTrack</h2>
        </div>
        <button 
          onClick={() => setSidebarOpen(false)} 
          className="lg:hidden text-gray-500 hover:text-gray-700"
        >
          <i className="ri-close-line text-2xl"></i>
        </button>
      </div>
      
      <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
        {navItems.map(item => (
          <Link key={item.path} href={item.path}>
            <a
              className={cn(
                "flex items-center w-full px-4 py-3 text-sm font-medium rounded-md transition-colors",
                location === item.path
                  ? "bg-primary-50 text-primary-700"
                  : "text-gray-600 hover:bg-gray-50"
              )}
              onClick={() => setSidebarOpen(false)}
            >
              <i className={`${item.icon} text-xl mr-3`}></i>
              {item.label}
            </a>
          </Link>
        ))}
      </nav>
      
      <div className="p-4 border-t">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-primary-100 flex items-center justify-center text-primary-600">
                {user?.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-800">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="mt-4 w-full"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
        >
          <i className="ri-logout-box-r-line mr-2"></i>
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
