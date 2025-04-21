import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertTransactionSchema, insertSavingsGoalSchema } from "@shared/schema";
import { plaidClient } from "./plaid";
import { CountryCode, Products } from "plaid";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Transaction routes
  app.get("/api/transactions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const userId = req.user!.id;
    const transactions = await storage.getTransactions(userId);
    res.json(transactions);
  });
  
  app.post("/api/transactions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user!.id;
      const transactionData = insertTransactionSchema.parse({
        ...req.body,
        userId
      });
      
      const transaction = await storage.createTransaction(transactionData);
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create transaction" });
      }
    }
  });
  
  app.get("/api/transactions/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const transactionId = parseInt(req.params.id);
    const transaction = await storage.getTransaction(transactionId);
    
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    
    // Only allow access to the user's own transactions
    if (transaction.userId !== req.user!.id) {
      return res.sendStatus(403);
    }
    
    res.json(transaction);
  });
  
  app.put("/api/transactions/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const transactionId = parseInt(req.params.id);
    const transaction = await storage.getTransaction(transactionId);
    
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    
    // Only allow updating the user's own transactions
    if (transaction.userId !== req.user!.id) {
      return res.sendStatus(403);
    }
    
    try {
      // We don't want to update the userId field
      const { userId, ...updateData } = req.body;
      
      const updatedTransaction = await storage.updateTransaction(
        transactionId,
        updateData
      );
      
      res.json(updatedTransaction);
    } catch (error) {
      res.status(500).json({ error: "Failed to update transaction" });
    }
  });
  
  app.delete("/api/transactions/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const transactionId = parseInt(req.params.id);
    const transaction = await storage.getTransaction(transactionId);
    
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    
    // Only allow deleting the user's own transactions
    if (transaction.userId !== req.user!.id) {
      return res.sendStatus(403);
    }
    
    const deleted = await storage.deleteTransaction(transactionId);
    
    if (deleted) {
      res.sendStatus(204);
    } else {
      res.status(500).json({ error: "Failed to delete transaction" });
    }
  });
  
  // Savings Goal routes
  app.get("/api/savings-goals", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const userId = req.user!.id;
    const goals = await storage.getSavingsGoals(userId);
    res.json(goals);
  });
  
  app.post("/api/savings-goals", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user!.id;
      const goalData = insertSavingsGoalSchema.parse({
        ...req.body,
        userId
      });
      
      const goal = await storage.createSavingsGoal(goalData);
      res.status(201).json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create savings goal" });
      }
    }
  });
  
  app.get("/api/savings-goals/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const goalId = parseInt(req.params.id);
    const goal = await storage.getSavingsGoal(goalId);
    
    if (!goal) {
      return res.status(404).json({ error: "Savings goal not found" });
    }
    
    // Only allow access to the user's own goals
    if (goal.userId !== req.user!.id) {
      return res.sendStatus(403);
    }
    
    res.json(goal);
  });
  
  app.put("/api/savings-goals/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const goalId = parseInt(req.params.id);
    const goal = await storage.getSavingsGoal(goalId);
    
    if (!goal) {
      return res.status(404).json({ error: "Savings goal not found" });
    }
    
    // Only allow updating the user's own goals
    if (goal.userId !== req.user!.id) {
      return res.sendStatus(403);
    }
    
    try {
      // We don't want to update the userId field
      const { userId, ...updateData } = req.body;
      
      const updatedGoal = await storage.updateSavingsGoal(
        goalId,
        updateData
      );
      
      res.json(updatedGoal);
    } catch (error) {
      res.status(500).json({ error: "Failed to update savings goal" });
    }
  });
  
  app.delete("/api/savings-goals/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const goalId = parseInt(req.params.id);
    const goal = await storage.getSavingsGoal(goalId);
    
    if (!goal) {
      return res.status(404).json({ error: "Savings goal not found" });
    }
    
    // Only allow deleting the user's own goals
    if (goal.userId !== req.user!.id) {
      return res.sendStatus(403);
    }
    
    const deleted = await storage.deleteSavingsGoal(goalId);
    
    if (deleted) {
      res.sendStatus(204);
    } else {
      res.status(500).json({ error: "Failed to delete savings goal" });
    }
  });
  
  // Category routes
  app.get("/api/categories", async (req, res) => {
    const categories = await storage.getCategories();
    res.json(categories);
  });
  
  app.get("/api/categories/type/:type", async (req, res) => {
    const type = req.params.type;
    if (type !== 'income' && type !== 'expense') {
      return res.status(400).json({ error: "Type must be 'income' or 'expense'" });
    }
    
    const categories = await storage.getCategoriesByType(type);
    res.json(categories);
  });

  // Plaid API routes
  // Check Plaid availability
  app.get("/api/plaid/status", (req, res) => {
    const available = !!(process.env.PLAID_CLIENT_ID && process.env.PLAID_SECRET);
    res.json({ available });
  });

  // Create a link token
  app.post("/api/plaid/create-link-token", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      // Check if Plaid credentials are configured
      if (!process.env.PLAID_CLIENT_ID || !process.env.PLAID_SECRET) {
        return res.status(500).json({ 
          error: "Plaid API credentials are not configured" 
        });
      }

      const userId = req.user!.id.toString();
  
      const request = {
        user: {
          client_user_id: userId
        },
        client_name: 'Personal Finance Tracker',
        products: [Products.Transactions],
        language: 'en',
        country_codes: [CountryCode.Us],
        webhook: `${req.protocol}://${req.get('host')}/api/plaid/webhook`,
      };
      
      const createTokenResponse = await plaidClient.linkTokenCreate(request);
      res.json(createTokenResponse.data);
    } catch (error: any) {
      console.error('Error creating Plaid link token:', error);
      res.status(500).json({ 
        error: "Failed to create link token", 
        details: error.message 
      });
    }
  });

  // Exchange public token for access token
  app.post("/api/plaid/exchange-token", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      // Check if Plaid credentials are configured
      if (!process.env.PLAID_CLIENT_ID || !process.env.PLAID_SECRET) {
        return res.status(500).json({ 
          error: "Plaid API credentials are not configured" 
        });
      }
      
      const publicToken = req.body.public_token;
      
      if (!publicToken) {
        return res.status(400).json({ error: "Missing public_token" });
      }
      
      const exchangeResponse = await plaidClient.itemPublicTokenExchange({
        public_token: publicToken
      });
      
      const accessToken = exchangeResponse.data.access_token;
      const itemId = exchangeResponse.data.item_id;
      
      // Store the access token and item ID associated with the user
      // This would typically go in your database
      // We'll use a simple log for demonstration purposes
      console.log(`User ${req.user!.id} linked account. Item ID: ${itemId}`);

      // TODO: Store these credentials in a PlaidAccounts table in the database
      
      // After getting the access token, fetch transactions
      // This would be part of a separate sync mechanism in a production app
      // For now, we'll do an initial fetch
      await fetchPlaidTransactions(accessToken, req.user!.id);
      
      res.json({ status: "success" });
    } catch (error: any) {
      console.error('Error exchanging Plaid public token:', error);
      res.status(500).json({ 
        error: "Failed to exchange token", 
        details: error.message 
      });
    }
  });

  // Fetch transactions for a linked account
  app.post("/api/plaid/sync-transactions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      // Check if Plaid credentials are configured
      if (!process.env.PLAID_CLIENT_ID || !process.env.PLAID_SECRET) {
        return res.status(500).json({ 
          error: "Plaid API credentials are not configured" 
        });
      }
      
      // In a real application, you would fetch the access token from the database
      // based on the user's ID and the selected account
      const accessToken = req.body.access_token;
      
      if (!accessToken) {
        return res.status(400).json({ error: "Missing access_token" });
      }
      
      await fetchPlaidTransactions(accessToken, req.user!.id);
      
      res.json({ status: "success" });
    } catch (error: any) {
      console.error('Error syncing Plaid transactions:', error);
      res.status(500).json({ 
        error: "Failed to sync transactions", 
        details: error.message 
      });
    }
  });

  // Helper function to fetch and process Plaid transactions
  async function fetchPlaidTransactions(accessToken: string, userId: number) {
    try {
      // Get transactions from the last 30 days
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      const request = {
        access_token: accessToken,
        start_date: thirtyDaysAgo.toISOString().split('T')[0],
        end_date: now.toISOString().split('T')[0],
      };
      
      const response = await plaidClient.transactionsGet(request);
      const transactions = response.data.transactions;
      
      // Process each transaction and save to our database
      for (const plaidTx of transactions) {
        // Skip pending transactions
        if (plaidTx.pending) continue;
        
        // Determine transaction type (expense by default)
        const type = plaidTx.amount < 0 ? "income" : "expense";
        
        // Format the amount as a positive number
        const amount = Math.abs(plaidTx.amount).toString();
        
        // Try to map Plaid categories to our app's categories
        // In a real app, you'd have a more sophisticated mapping
        let category = "Other";
        if (plaidTx.category && plaidTx.category.length > 0) {
          // Use the most specific category (last one in the array)
          const plaidCategory = plaidTx.category[plaidTx.category.length - 1];
          
          // You could have a mapping table here
          // For now, we'll just use the Plaid category directly
          category = plaidCategory;
        }
        
        // Create the transaction in our system
        await storage.createTransaction({
          userId,
          type,
          amount,
          date: plaidTx.date,
          description: plaidTx.name,
          category,
          notes: `Imported from Plaid: ${plaidTx.merchant_name || 'Unknown merchant'}`
        });
      }
      
      console.log(`Imported ${transactions.length} transactions for user ${userId}`);
    } catch (error) {
      console.error('Error fetching Plaid transactions:', error);
      throw error;
    }
  }

  // Dashboard data API endpoint
  app.get("/api/dashboard", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user!.id;
      
      // Get all transactions
      const transactions = await storage.getTransactions(userId);
      
      // Get all savings goals
      const savingsGoals = await storage.getSavingsGoals(userId);
      
      // Calculate total income and expenses
      const totalIncome = transactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + Number(t.amount), 0);
        
      const totalExpenses = transactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + Number(t.amount), 0);
        
      // Calculate net balance
      const netBalance = totalIncome - totalExpenses;

      // Get recent transactions (last 5)
      const recentTransactions = [...transactions]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

      // Calculate month-over-month change
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      
      const currentMonthTransactions = transactions.filter(t => {
        const date = new Date(t.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      });
      
      const lastMonthTransactions = transactions.filter(t => {
        const date = new Date(t.date);
        return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
      });
      
      const currentMonthIncome = currentMonthTransactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + Number(t.amount), 0);
        
      const currentMonthExpenses = currentMonthTransactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + Number(t.amount), 0);
        
      const lastMonthIncome = lastMonthTransactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + Number(t.amount), 0);
        
      const lastMonthExpenses = lastMonthTransactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      // Calculate percent changes
      const incomeChange = lastMonthIncome === 0 
        ? 100 
        : Math.round(((currentMonthIncome - lastMonthIncome) / lastMonthIncome) * 100);
        
      const expenseChange = lastMonthExpenses === 0 
        ? 100 
        : Math.round(((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100);
        
      const savingsRate = totalIncome === 0 
        ? 0 
        : Math.round(((totalIncome - totalExpenses) / totalIncome) * 100);

      res.json({
        summary: {
          totalIncome,
          totalExpenses,
          netBalance,
          savingsRate,
          incomeChange,
          expenseChange
        },
        recentTransactions,
        savingsGoals,
        transactions
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard data" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
