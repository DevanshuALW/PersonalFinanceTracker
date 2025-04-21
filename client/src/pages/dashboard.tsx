import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import SummaryCard from "@/components/dashboard/summary-card";
import IncomeExpenseChart from "@/components/dashboard/income-expense-chart";
import ExpenseBreakdownChart from "@/components/dashboard/expense-breakdown-chart";
import RecentTransactions from "@/components/dashboard/recent-transactions";
import SavingsGoalsOverview from "@/components/dashboard/savings-goals-overview";
import { Transaction, SavingsGoal } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { user } = useAuth();

  const { data: transactions, isLoading: isLoadingTransactions } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const { data: savingsGoals, isLoading: isLoadingSavingsGoals } = useQuery<SavingsGoal[]>({
    queryKey: ["/api/savings-goals"],
  });

  // Calculate financial summary
  const calculateSummary = () => {
    if (!transactions) return { balance: 0, income: 0, expense: 0 };

    const income = transactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const expense = transactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    return {
      balance: income - expense,
      income,
      expense
    };
  };

  const summary = calculateSummary();

  return (
    <main className="flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-6">
      {/* Dashboard Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Financial Dashboard</h1>
        <p className="text-gray-600">Track your income, expenses, and savings goals</p>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        {isLoadingTransactions ? (
          <>
            <Skeleton className="h-[120px] w-full rounded-xl" />
            <Skeleton className="h-[120px] w-full rounded-xl" />
            <Skeleton className="h-[120px] w-full rounded-xl" />
          </>
        ) : (
          <>
            <SummaryCard 
              title="Balance" 
              amount={summary.balance} 
              icon="ri-wallet-3-line" 
              iconColor="bg-primary-50 text-primary-600"
              changePercent={6.2}
              positive={true}
            />
            <SummaryCard 
              title="Income" 
              amount={summary.income} 
              icon="ri-arrow-down-circle-line" 
              iconColor="bg-success-50 text-success-600"
              changePercent={4.1}
              positive={true}
            />
            <SummaryCard 
              title="Expenses" 
              amount={summary.expense} 
              icon="ri-arrow-up-circle-line" 
              iconColor="bg-danger-50 text-danger-500"
              changePercent={2.5}
              positive={false}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expenses Chart */}
        <div className="lg:col-span-2">
          {isLoadingTransactions ? (
            <Skeleton className="h-[364px] w-full rounded-xl" />
          ) : (
            <IncomeExpenseChart transactions={transactions || []} />
          )}
        </div>

        {/* Expense Breakdown Chart */}
        {isLoadingTransactions ? (
          <Skeleton className="h-[364px] w-full rounded-xl" />
        ) : (
          <ExpenseBreakdownChart transactions={transactions || []} />
        )}
      </div>

      {/* Savings Goals */}
      {isLoadingSavingsGoals ? (
        <Skeleton className="h-[200px] w-full rounded-xl mt-6" />
      ) : (
        <SavingsGoalsOverview goals={savingsGoals || []} />
      )}

      {/* Recent Transactions */}
      {isLoadingTransactions ? (
        <Skeleton className="h-[300px] w-full rounded-xl mt-6" />
      ) : (
        <RecentTransactions transactions={transactions || []} />
      )}
    </main>
  );
}
