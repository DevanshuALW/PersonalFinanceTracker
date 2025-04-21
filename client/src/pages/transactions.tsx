import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Transaction } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { format } from "date-fns";
import TransactionForm from "@/components/transactions/transaction-form";
import TransactionFilters from "@/components/transactions/transaction-filters";

export default function Transactions() {
  const { toast } = useToast();
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [filters, setFilters] = useState({
    type: "all",
    category: "all",
    dateRange: "this-month",
    search: "",
  });

  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({
        title: "Transaction deleted",
        description: "Transaction has been deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete transaction",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Apply filters to transactions
  const filteredTransactions = transactions ? [...transactions].filter(transaction => {
    // Filter by type
    if (filters.type !== "all" && transaction.type !== filters.type) {
      return false;
    }
    
    // Filter by category
    if (filters.category !== "all" && transaction.category !== filters.category) {
      return false;
    }
    
    // Filter by search term
    if (filters.search && !transaction.description.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    // Filter by date range
    const transactionDate = new Date(transaction.date);
    const today = new Date();
    
    if (filters.dateRange === "this-month") {
      return transactionDate.getMonth() === today.getMonth() && 
             transactionDate.getFullYear() === today.getFullYear();
    } else if (filters.dateRange === "last-month") {
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1);
      return transactionDate.getMonth() === lastMonth.getMonth() && 
             transactionDate.getFullYear() === lastMonth.getFullYear();
    } else if (filters.dateRange === "3-months") {
      const threeMonthsAgo = new Date(today);
      threeMonthsAgo.setMonth(today.getMonth() - 3);
      return transactionDate >= threeMonthsAgo;
    } else if (filters.dateRange === "6-months") {
      const sixMonthsAgo = new Date(today);
      sixMonthsAgo.setMonth(today.getMonth() - 6);
      return transactionDate >= sixMonthsAgo;
    } else if (filters.dateRange === "year") {
      return transactionDate.getFullYear() === today.getFullYear();
    }
    
    return true;
  }) : [];

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowAddTransaction(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <main className="flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-6">
      {/* Transactions Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600">Manage your income and expenses</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button 
            onClick={() => {
              setEditingTransaction(null);
              setShowAddTransaction(true);
            }}
          >
            <i className="ri-add-line mr-2"></i>
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Transaction Filters */}
      <TransactionFilters filters={filters} setFilters={setFilters} />

      {/* Transactions List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-6">
        {isLoading ? (
          <div className="p-4 space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No transactions found. Try adjusting your filters or add a new transaction.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                            <i className="ri-shopping-bag-line text-gray-600"></i>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{transaction.description}</div>
                            {transaction.notes && (
                              <div className="text-xs text-gray-500">{transaction.notes}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {transaction.type === 'income' ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {transaction.category}
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {transaction.category}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(transaction.date), 'MMM dd, yyyy')}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium font-mono ${transaction.type === 'income' ? 'text-success-500' : 'text-danger-500'}`}>
                        {transaction.type === 'income' ? '+' : '-'}${Number(transaction.amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          className="text-primary-600 hover:text-primary-900 mr-3"
                          onClick={() => handleEdit(transaction)}
                        >
                          Edit
                        </button>
                        <button 
                          className="text-danger-500 hover:text-danger-700"
                          onClick={() => handleDelete(transaction.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {filteredTransactions.length > 0 && (
          <div className="px-6 py-3 border-t flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {Math.min(1, filteredTransactions.length)} to {filteredTransactions.length} of {filteredTransactions.length} transactions
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" disabled>
                Previous
              </Button>
              <Button disabled>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Modal */}
      <Dialog open={showAddTransaction} onOpenChange={setShowAddTransaction}>
        <DialogContent className="max-w-lg">
          <TransactionForm 
            onClose={() => setShowAddTransaction(false)} 
            transaction={editingTransaction} 
          />
        </DialogContent>
      </Dialog>
    </main>
  );
}
