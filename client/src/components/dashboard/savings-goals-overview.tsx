import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SavingsGoal } from "@shared/schema";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";

interface SavingsGoalsOverviewProps {
  goals: SavingsGoal[];
}

export default function SavingsGoalsOverview({ goals }: SavingsGoalsOverviewProps) {
  // Display up to 3 savings goals
  const displayGoals = goals.slice(0, 3);

  // Calculate progress percentage
  const calculateProgress = (current: number, target: number) => {
    return Math.round((Number(current) / Number(target)) * 100);
  };

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md font-medium">Savings Goals</CardTitle>
        <Link href="/savings">
          <Button variant="ghost" size="sm" className="h-auto text-primary-600 hover:text-primary-700 p-0">
            <i className="ri-add-line mr-1"></i> Add Goal
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {displayGoals.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-4">You haven't set any savings goals yet.</p>
            <Link href="/savings">
              <Button>Create Your First Goal</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayGoals.map((goal) => {
              const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
              
              return (
                <div key={goal.id} className="border border-gray-100 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                      <i className={`${goal.icon} text-lg`}></i>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-gray-900">{goal.title}</h4>
                      <p className="text-xs text-gray-500">
                        Target: {format(new Date(goal.targetDate), 'MMM yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        ${Number(goal.currentAmount).toLocaleString()} / ${Number(goal.targetAmount).toLocaleString()}
                      </span>
                      <span className="font-medium text-primary-600">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2.5" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
