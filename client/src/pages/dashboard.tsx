import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import SummaryCard from "@/components/dashboard/summary-card";
import IncomeExpenseChart from "@/components/dashboard/income-expense-chart";
import ExpenseBreakdownChart from "@/components/dashboard/expense-breakdown-chart";
import RecentTransactions from "@/components/dashboard/recent-transactions";
import SavingsGoalsOverview from "@/components/dashboard/savings-goals-overview";
import { Transaction, SavingsGoal } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardData {
  summary: {
    totalIncome: number;
    totalExpenses: number;
    netBalance: number;
    savingsRate: number;
    incomeChange: number;
    expenseChange: number;
  };
  recentTransactions: Transaction[];
  savingsGoals: SavingsGoal[];
  transactions: Transaction[];
}

export default function Dashboard() {
  const { user } = useAuth();

  const { data: dashboardData, isLoading } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard"],
  });

  return (
    <main className="flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-6">
      {/* Dashboard Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Financial Dashboard</h1>
        <p className="text-gray-600">Track your income, expenses, and savings goals</p>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        {isLoading ? (
          <>
            <Skeleton className="h-[120px] w-full rounded-xl" />
            <Skeleton className="h-[120px] w-full rounded-xl" />
            <Skeleton className="h-[120px] w-full rounded-xl" />
          </>
        ) : (
          <>
            <SummaryCard 
              title="Balance" 
              amount={dashboardData?.summary.netBalance || 0} 
              icon="ri-wallet-3-line" 
              iconColor="bg-primary-50 text-primary-600"
              changePercent={dashboardData?.summary.savingsRate || 0}
              positive={true}
            />
            <SummaryCard 
              title="Income" 
              amount={dashboardData?.summary.totalIncome || 0} 
              icon="ri-arrow-down-circle-line" 
              iconColor="bg-success-50 text-success-600"
              changePercent={dashboardData?.summary.incomeChange || 0}
              positive={dashboardData?.summary.incomeChange ? dashboardData.summary.incomeChange > 0 : true}
            />
            <SummaryCard 
              title="Expenses" 
              amount={dashboardData?.summary.totalExpenses || 0} 
              icon="ri-arrow-up-circle-line" 
              iconColor="bg-danger-50 text-danger-500"
              changePercent={Math.abs(dashboardData?.summary.expenseChange || 0)}
              positive={dashboardData?.summary.expenseChange ? dashboardData.summary.expenseChange < 0 : false}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expenses Chart */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <Skeleton className="h-[364px] w-full rounded-xl" />
          ) : (
            <IncomeExpenseChart transactions={dashboardData?.transactions || []} />
          )}
        </div>

        {/* Expense Breakdown Chart */}
        {isLoading ? (
          <Skeleton className="h-[364px] w-full rounded-xl" />
        ) : (
          <ExpenseBreakdownChart transactions={dashboardData?.transactions || []} />
        )}
      </div>

      {/* Savings Goals */}
      {isLoading ? (
        <Skeleton className="h-[200px] w-full rounded-xl mt-6" />
      ) : (
        <SavingsGoalsOverview goals={dashboardData?.savingsGoals || []} />
      )}

      {/* Recent Transactions */}
      {isLoading ? (
        <Skeleton className="h-[300px] w-full rounded-xl mt-6" />
      ) : (
        <RecentTransactions transactions={dashboardData?.recentTransactions || []} />
      )}
    </main>
  );
}
