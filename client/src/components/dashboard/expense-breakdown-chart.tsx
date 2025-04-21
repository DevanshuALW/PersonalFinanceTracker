import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transaction } from "@shared/schema";
import { useState, useEffect, useRef } from "react";
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

interface ExpenseBreakdownChartProps {
  transactions: Transaction[];
}

interface CategorySummary {
  category: string;
  amount: number;
  color: string;
}

// Category colors
const categoryColors: Record<string, string> = {
  'Housing': '#a78bfa',     // purple
  'Food': '#3b82f6',        // blue
  'Transportation': '#f59e0b', // yellow
  'Entertainment': '#10b981', // green
  'Utilities': '#6366f1',   // indigo
  'Health': '#ec4899',      // pink
  'Education': '#8b5cf6',   // violet
  'Other': '#ef4444',       // red
};

export default function ExpenseBreakdownChart({ transactions }: ExpenseBreakdownChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart<"doughnut", number[], string> | null>(null);
  
  // Process transactions for chart
  const processChartData = (): CategorySummary[] => {
    // Only include expense transactions
    const expenses = transactions.filter(t => t.type === "expense");
    
    // Group by category and sum amounts
    const categoryMap = new Map<string, number>();
    
    expenses.forEach(expense => {
      const currentAmount = categoryMap.get(expense.category) || 0;
      categoryMap.set(expense.category, currentAmount + Number(expense.amount));
    });
    
    // Convert to array and sort by amount (descending)
    const categories = Array.from(categoryMap.entries())
      .map(([category, amount]) => ({
        category,
        amount,
        color: categoryColors[category] || '#6b7280' // default gray if color not found
      }))
      .sort((a, b) => b.amount - a.amount);
    
    return categories;
  };

  // Update chart
  useEffect(() => {
    if (chartRef.current) {
      // Destroy previous chart if it exists
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        const categoriesData = processChartData();
        
        chartInstance.current = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: categoriesData.map(c => c.category),
            datasets: [{
              data: categoriesData.map(c => c.amount),
              backgroundColor: categoriesData.map(c => c.color),
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
              legend: {
                display: false
              }
            }
          }
        });
      }
    }
    
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [transactions]);

  const categoryData = processChartData();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-medium">Expense Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-52 flex justify-center">
          <canvas ref={chartRef}></canvas>
        </div>
        <div className="mt-4 space-y-3">
          {categoryData.slice(0, 5).map((category) => (
            <div key={category.category} className="flex items-center">
              <span 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: category.color }}
              ></span>
              <span className="text-sm text-gray-600">{category.category}</span>
              <span className="ml-auto text-sm font-medium font-mono">
                ${category.amount.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
