import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertTransactionSchema, insertSavingsGoalSchema } from "@shared/schema";
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

  const httpServer = createServer(app);

  return httpServer;
}
