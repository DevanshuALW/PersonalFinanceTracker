import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { SavingsGoal } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { format, addMonths } from "date-fns";

interface SavingsGoalFormProps {
  savingsGoal?: SavingsGoal | null;
  onClose: () => void;
}

const savingsGoalSchema = z.object({
  title: z.string().min(1, "Title is required"),
  icon: z.string().min(1, "Icon is required"),
  currentAmount: z.string().min(1, "Current amount is required").regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format"),
  targetAmount: z.string().min(1, "Target amount is required").regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format"),
  targetDate: z.string().min(1, "Target date is required"),
});

type SavingsGoalFormValues = z.infer<typeof savingsGoalSchema>;

// Available icons
const goalIcons = [
  { value: "ri-home-4-line", label: "Home" },
  { value: "ri-car-line", label: "Car" },
  { value: "ri-plane-line", label: "Travel" },
  { value: "ri-graduation-cap-line", label: "Education" },
  { value: "ri-bank-line", label: "Savings" },
  { value: "ri-heart-line", label: "Health" },
  { value: "ri-gift-line", label: "Gift" },
  { value: "ri-shopping-bag-line", label: "Shopping" },
  { value: "ri-computer-line", label: "Technology" },
  { value: "ri-gamepad-line", label: "Entertainment" },
];

export default function SavingsGoalForm({ savingsGoal, onClose }: SavingsGoalFormProps) {
  const { toast } = useToast();
  const isEditing = !!savingsGoal;

  // Create savings goal mutation
  const createMutation = useMutation({
    mutationFn: async (data: SavingsGoalFormValues) => {
      const payload = {
        ...data,
        currentAmount: parseFloat(data.currentAmount),
        targetAmount: parseFloat(data.targetAmount),
      };
      
      return apiRequest("POST", "/api/savings-goals", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/savings-goals"] });
      toast({
        title: "Success",
        description: "Savings goal created successfully",
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update savings goal mutation
  const updateMutation = useMutation({
    mutationFn: async (data: SavingsGoalFormValues) => {
      const payload = {
        ...data,
        currentAmount: parseFloat(data.currentAmount),
        targetAmount: parseFloat(data.targetAmount),
      };
      
      return apiRequest("PUT", `/api/savings-goals/${savingsGoal!.id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/savings-goals"] });
      toast({
        title: "Success",
        description: "Savings goal updated successfully",
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Default target date is 6 months from now if not editing
  const defaultTargetDate = isEditing 
    ? format(new Date(savingsGoal.targetDate), "yyyy-MM-dd")
    : format(addMonths(new Date(), 6), "yyyy-MM-dd");

  const form = useForm<SavingsGoalFormValues>({
    resolver: zodResolver(savingsGoalSchema),
    defaultValues: {
      title: savingsGoal?.title || "",
      icon: savingsGoal?.icon || "ri-home-4-line",
      currentAmount: savingsGoal ? String(savingsGoal.currentAmount) : "0",
      targetAmount: savingsGoal ? String(savingsGoal.targetAmount) : "",
      targetDate: defaultTargetDate,
    },
  });

  const onSubmit = (values: SavingsGoalFormValues) => {
    if (isEditing) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          {isEditing ? "Edit Savings Goal" : "Create New Savings Goal"}
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
          <i className="ri-close-line text-xl"></i>
        </button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Goal Title</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. New Home Down Payment" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Icon</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an icon" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {goalIcons.map((icon) => (
                      <SelectItem key={icon.value} value={icon.value}>
                        <div className="flex items-center">
                          <i className={`${icon.value} mr-2`}></i>
                          <span>{icon.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="currentAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Amount</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <Input placeholder="0.00" {...field} className="pl-7" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="targetAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Amount</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <Input placeholder="0.00" {...field} className="pl-7" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="targetDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : (
                isEditing ? "Update Goal" : "Create Goal"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
