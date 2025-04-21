import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  return (
    <Route path={path}>
      <div className="min-h-screen flex flex-col">
        <header className="lg:hidden bg-white shadow-sm py-3 px-4 flex items-center justify-between sticky top-0 z-40">
          <button className="text-gray-600 hover:text-primary-600 transition-colors p-1">
            <i className="ri-menu-line text-2xl"></i>
          </button>
          <h1 className="text-xl font-semibold text-gray-800">Finance Tracker</h1>
          <div className="relative">
            <div className="w-8 h-8 rounded-full overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-primary-100 flex items-center justify-center text-primary-600">
                  {user.name.charAt(0)}
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <Component />
        </div>

        <MobileNav />
      </div>
    </Route>
  );
}
