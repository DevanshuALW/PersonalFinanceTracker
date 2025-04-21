import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { SavingsGoal } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { format } from "date-fns";
import SavingsGoalForm from "@/components/savings/savings-goal-form";
import { Progress } from "@/components/ui/progress";

export default function Savings() {
  const { toast } = useToast();
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

  const { data: savingsGoals, isLoading } = useQuery<SavingsGoal[]>({
    queryKey: ["/api/savings-goals"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/savings-goals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/savings-goals"] });
      toast({
        title: "Savings goal deleted",
        description: "Savings goal has been deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete savings goal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setShowAddGoal(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this savings goal?")) {
      deleteMutation.mutate(id);
    }
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.round((Number(current) / Number(target)) * 100);
  };

  const calculateMonthlyAverage = (goal: SavingsGoal) => {
    const createdAt = new Date(goal.createdAt);
    const today = new Date();
    
    // Calculate months between creation and today
    const months = (today.getFullYear() - createdAt.getFullYear()) * 12 + 
                   (today.getMonth() - createdAt.getMonth());
    
    // If less than a month, use 1 month
    const adjustedMonths = Math.max(1, months);
    
    return Number(goal.currentAmount) / adjustedMonths;
  };

  return (
    <main className="flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-6">
      {/* Savings Goals Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Savings Goals</h1>
          <p className="text-gray-600">Track and manage your savings targets</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button 
            onClick={() => {
              setEditingGoal(null);
              setShowAddGoal(true);
            }}
          >
            <i className="ri-add-line mr-2"></i>
            New Savings Goal
          </Button>
        </div>
      </div>

      {/* Savings Goals List */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[250px] w-full rounded-xl" />
          <Skeleton className="h-[250px] w-full rounded-xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {savingsGoals && savingsGoals.length > 0 ? (
            savingsGoals.map((goal) => {
              const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
              const remaining = Number(goal.targetAmount) - Number(goal.currentAmount);
              const monthlyAverage = calculateMonthlyAverage(goal);
              
              return (
                <div key={goal.id} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                        <i className={`${goal.icon} text-xl`}></i>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">{goal.title}</h3>
                        <p className="text-sm text-gray-500">Target: {format(new Date(goal.targetDate), 'MMM yyyy')}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <button 
                        className="text-gray-400 hover:text-gray-500 p-1"
                        onClick={() => handleEdit(goal)}
                      >
                        <i className="ri-pencil-line"></i>
                      </button>
                      <button 
                        className="text-gray-400 hover:text-gray-500 p-1 ml-2"
                        onClick={() => handleDelete(goal.id)}
                      >
                        <i className="ri-delete-bin-6-line"></i>
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Current Amount</span>
                      <span className="font-medium font-mono">${Number(goal.currentAmount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Target Amount</span>
                      <span className="font-medium font-mono">${Number(goal.targetAmount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Remaining</span>
                      <span className="font-medium font-mono">${remaining.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium text-primary-600">{progress}%</span>
                    </div>
                  </div>
                  
                  <Progress value={progress} className="h-2.5 mb-4" />
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">${monthlyAverage.toFixed(0)}</span> saved per month on average
                    </div>
                    <Button 
                      variant="outline"
                      className="text-primary-600"
                      onClick={() => handleEdit(goal)}
                    >
                      Add Money
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-1 lg:col-span-2 bg-white rounded-xl shadow-sm p-8 border border-gray-100 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mb-4">
                <i className="ri-money-dollar-box-line text-2xl"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Savings Goals Yet</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                Start saving for your future by creating savings goals for things like a vacation, new car, or emergency fund.
              </p>
              <Button 
                onClick={() => {
                  setEditingGoal(null);
                  setShowAddGoal(true);
                }}
              >
                <i className="ri-add-line mr-2"></i>
                Create Your First Goal
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Savings Goal Modal */}
      <Dialog open={showAddGoal} onOpenChange={setShowAddGoal}>
        <DialogContent className="max-w-lg">
          <SavingsGoalForm 
            onClose={() => setShowAddGoal(false)} 
            savingsGoal={editingGoal} 
          />
        </DialogContent>
      </Dialog>
    </main>
  );
}
