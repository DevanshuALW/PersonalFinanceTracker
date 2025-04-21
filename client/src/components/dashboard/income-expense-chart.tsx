import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transaction } from "@shared/schema";
import { useState, useEffect, useRef } from "react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { Chart, registerables } from 'chart.js';
import { Button } from "@/components/ui/button";

// Register Chart.js components
Chart.register(...registerables);

interface IncomeExpenseChartProps {
  transactions: Transaction[];
}

export default function IncomeExpenseChart({ transactions }: IncomeExpenseChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart<"bar", number[], string> | null>(null);
  const [timeframe, setTimeframe] = useState<"monthly" | "yearly">("monthly");

  // Process transactions for chart
  const processChartData = () => {
    if (timeframe === "monthly") {
      // Get last 6 months
      const monthsData = [];
      const today = new Date();
      
      for (let i = 5; i >= 0; i--) {
        const month = subMonths(today, i);
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        const monthLabel = format(month, "MMM");
        
        const monthTransactions = transactions.filter(t => {
          const date = new Date(t.date);
          return date >= monthStart && date <= monthEnd;
        });
        
        const income = monthTransactions
          .filter(t => t.type === "income")
          .reduce((sum, t) => sum + Number(t.amount), 0);
        
        const expense = monthTransactions
          .filter(t => t.type === "expense")
          .reduce((sum, t) => sum + Number(t.amount), 0);
        
        monthsData.push({
          label: monthLabel,
          income,
          expense
        });
      }
      
      return monthsData;
    } else {
      // Yearly data (by quarters)
      const yearData = [
        { label: "Q1", income: 0, expense: 0 },
        { label: "Q2", income: 0, expense: 0 },
        { label: "Q3", income: 0, expense: 0 },
        { label: "Q4", income: 0, expense: 0 }
      ];
      
      const currentYear = new Date().getFullYear();
      
      transactions.forEach(t => {
        const date = new Date(t.date);
        if (date.getFullYear() === currentYear) {
          const quarter = Math.floor(date.getMonth() / 3);
          
          if (t.type === "income") {
            yearData[quarter].income += Number(t.amount);
          } else {
            yearData[quarter].expense += Number(t.amount);
          }
        }
      });
      
      return yearData;
    }
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
        const chartData = processChartData();
        
        chartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: chartData.map(d => d.label),
            datasets: [
              {
                label: 'Income',
                data: chartData.map(d => d.income),
                backgroundColor: '#10b981',
                borderColor: '#10b981',
                borderWidth: 1
              },
              {
                label: 'Expenses',
                data: chartData.map(d => d.expense),
                backgroundColor: '#ef4444',
                borderColor: '#ef4444',
                borderWidth: 1
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: function(value) {
                    return '$' + value.toLocaleString();
                  }
                }
              }
            },
            plugins: {
              legend: {
                position: 'top',
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
  }, [transactions, timeframe]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md font-medium">Income vs Expenses</CardTitle>
        <div className="flex items-center space-x-2 text-sm">
          <Button 
            variant={timeframe === "monthly" ? "default" : "ghost"} 
            size="sm"
            onClick={() => setTimeframe("monthly")}
            className="px-2.5 py-1 h-auto"
          >
            Monthly
          </Button>
          <Button 
            variant={timeframe === "yearly" ? "default" : "ghost"} 
            size="sm"
            onClick={() => setTimeframe("yearly")}
            className="px-2.5 py-1 h-auto"
          >
            Yearly
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <canvas ref={chartRef}></canvas>
        </div>
      </CardContent>
    </Card>
  );
}
