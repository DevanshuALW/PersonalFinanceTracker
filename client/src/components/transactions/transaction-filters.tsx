import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Category } from "@shared/schema";

interface TransactionFiltersProps {
  filters: {
    type: string;
    category: string;
    dateRange: string;
    search: string;
  };
  setFilters: (filters: any) => void;
}

export default function TransactionFilters({ filters, setFilters }: TransactionFiltersProps) {
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="transaction-type" className="block text-xs font-medium text-gray-700 mb-1">
              Transaction Type
            </Label>
            <Select 
              value={filters.type} 
              onValueChange={(value) => setFilters({ ...filters, type: value })}
            >
              <SelectTrigger id="transaction-type">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="category" className="block text-xs font-medium text-gray-700 mb-1">
              Category
            </Label>
            <Select 
              value={filters.category} 
              onValueChange={(value) => setFilters({ ...filters, category: value })}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="date-range" className="block text-xs font-medium text-gray-700 mb-1">
              Date Range
            </Label>
            <Select 
              value={filters.dateRange} 
              onValueChange={(value) => setFilters({ ...filters, dateRange: value })}
            >
              <SelectTrigger id="date-range">
                <SelectValue placeholder="This Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="3-months">Last 3 Months</SelectItem>
                <SelectItem value="6-months">Last 6 Months</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="search" className="block text-xs font-medium text-gray-700 mb-1">
              Search
            </Label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="ri-search-line text-gray-400"></i>
              </div>
              <Input 
                type="text"
                id="search"
                placeholder="Search transactions..."
                className="pl-10"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
