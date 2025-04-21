import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Transactions from "@/pages/transactions";
import Savings from "@/pages/savings";
import LinkedAccounts from "@/pages/linked-accounts";
import AuthPage from "@/pages/auth-page";
import { ProtectedRoute } from "./lib/protected-route";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import { AuthProvider } from "./hooks/use-auth";

function Router() {
  return (
    <>
      <Switch>
        <Route path="/auth" component={AuthPage} />
        <Route>
          <div className="flex w-full h-full overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-6 lg:px-8">
              <Switch>
                <ProtectedRoute path="/" component={Dashboard} />
                <ProtectedRoute path="/transactions" component={Transactions} />
                <ProtectedRoute path="/savings" component={Savings} />
                <ProtectedRoute path="/linked-accounts" component={LinkedAccounts} />
                <Route component={NotFound} />
              </Switch>
            </main>
          </div>
          <MobileNav />
        </Route>
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <div className="min-h-screen flex flex-col">
            <div className="flex flex-1 overflow-hidden">
              <Router />
            </div>
          </div>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
