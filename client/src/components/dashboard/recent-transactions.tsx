import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transaction } from "@shared/schema";
import { format, isToday, isYesterday } from "date-fns";
import { Link } from "wouter";

interface RecentTransactionsProps {
  transactions: Transaction[];
}

const getCategoryIcon = (category: string): string => {
  switch (category) {
    case 'Food':
      return 'ri-shopping-bag-line';
    case 'Housing':
      return 'ri-home-4-line';
    case 'Transportation':
      return 'ri-car-line';
    case 'Entertainment':
      return 'ri-film-line';
    case 'Utilities':
      return 'ri-lightbulb-line';
    case 'Health':
      return 'ri-heart-pulse-line';
    case 'Education':
      return 'ri-book-open-line';
    case 'Salary':
      return 'ri-bank-line';
    case 'Investments':
      return 'ri-stock-line';
    case 'Gifts':
      return 'ri-gift-line';
    default:
      return 'ri-coins-line';
  }
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  
  if (isToday(date)) {
    return `Today, ${format(date, 'h:mm a')}`;
  } else if (isYesterday(date)) {
    return 'Yesterday';
  } else {
    return format(date, 'MMM d, yyyy');
  }
};

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  // Display only the 4 most recent transactions
  const recentTransactions = [...transactions].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  }).slice(0, 4);

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md font-medium">Recent Transactions</CardTitle>
        <Link href="/transactions" className="text-sm text-primary-600 hover:text-primary-700 flex items-center">
          View All <i className="ri-arrow-right-s-line ml-1"></i>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b">
                <th className="pb-3 font-medium">DESCRIPTION</th>
                <th className="pb-3 font-medium">CATEGORY</th>
                <th className="pb-3 font-medium">DATE</th>
                <th className="pb-3 font-medium text-right">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-gray-500">
                    No transactions yet. Add one to get started!
                  </td>
                </tr>
              ) : (
                recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-100">
                    <td className="py-3 pr-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                          <i className={`${getCategoryIcon(transaction.category)} text-gray-600`}></i>
                        </div>
                        <span className="font-medium text-sm">{transaction.description}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-sm text-gray-600">{transaction.category}</td>
                    <td className="py-3 pr-4 text-sm text-gray-600">{formatDate(transaction.date)}</td>
                    <td className={`py-3 text-right text-sm font-medium font-mono ${transaction.type === 'income' ? 'text-success-500' : 'text-danger-500'}`}>
                      {transaction.type === 'income' ? '+' : '-'}${Number(transaction.amount).toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
