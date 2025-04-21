import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import TransactionForm from "@/components/transactions/transaction-form";

export default function MobileNav() {
  const [location] = useLocation();
  const [showAddTransaction, setShowAddTransaction] = useState(false);

  return (
    <>
      <nav className="lg:hidden bg-white border-t fixed bottom-0 inset-x-0 z-40 flex items-center justify-around py-2">
        <Link href="/">
          <a className={`flex flex-col items-center justify-center px-3 py-2 ${location === "/" ? "text-primary-600" : "text-gray-600"}`}>
            <i className="ri-dashboard-line text-xl"></i>
            <span className="text-xs mt-1">Dashboard</span>
          </a>
        </Link>
        
        <Link href="/transactions">
          <a className={`flex flex-col items-center justify-center px-3 py-2 ${location === "/transactions" ? "text-primary-600" : "text-gray-600"}`}>
            <i className="ri-exchange-dollar-line text-xl"></i>
            <span className="text-xs mt-1">Transactions</span>
          </a>
        </Link>
        
        <button 
          className="flex flex-col items-center justify-center"
          onClick={() => setShowAddTransaction(true)}
        >
          <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white">
            <i className="ri-add-line text-2xl"></i>
          </div>
        </button>
        
        <Link href="/savings">
          <a className={`flex flex-col items-center justify-center px-3 py-2 ${location === "/savings" ? "text-primary-600" : "text-gray-600"}`}>
            <i className="ri-money-dollar-box-line text-xl"></i>
            <span className="text-xs mt-1">Goals</span>
          </a>
        </Link>
        
        <button className="flex flex-col items-center justify-center px-3 py-2 text-gray-600">
          <i className="ri-settings-4-line text-xl"></i>
          <span className="text-xs mt-1">Settings</span>
        </button>
      </nav>

      {/* Transaction Modal */}
      <Dialog open={showAddTransaction} onOpenChange={setShowAddTransaction}>
        <DialogContent className="max-w-lg">
          <TransactionForm 
            onClose={() => setShowAddTransaction(false)} 
            transaction={null} 
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
