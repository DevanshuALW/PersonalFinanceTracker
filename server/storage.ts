import { users, transactions, savingsGoals, categories, type User, type InsertUser, type Transaction, type InsertTransaction, type SavingsGoal, type InsertSavingsGoal, type Category, type InsertCategory } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Transaction operations
  getTransactions(userId: number): Promise<Transaction[]>;
  getTransactionsByType(userId: number, type: string): Promise<Transaction[]>;
  getTransactionsByCategory(userId: number, category: string): Promise<Transaction[]>;
  getTransactionsByDateRange(userId: number, startDate: Date, endDate: Date): Promise<Transaction[]>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined>;
  deleteTransaction(id: number): Promise<boolean>;
  
  // Savings Goal operations
  getSavingsGoals(userId: number): Promise<SavingsGoal[]>;
  getSavingsGoal(id: number): Promise<SavingsGoal | undefined>;
  createSavingsGoal(goal: InsertSavingsGoal): Promise<SavingsGoal>;
  updateSavingsGoal(id: number, goal: Partial<InsertSavingsGoal>): Promise<SavingsGoal | undefined>;
  deleteSavingsGoal(id: number): Promise<boolean>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  getCategoriesByType(type: string): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private transactions: Map<number, Transaction>;
  private savingsGoals: Map<number, SavingsGoal>;
  private categories: Map<number, Category>;
  
  userCurrentId: number;
  transactionCurrentId: number;
  savingsGoalCurrentId: number;
  categoryCurrentId: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.transactions = new Map();
    this.savingsGoals = new Map();
    this.categories = new Map();
    
    this.userCurrentId = 1;
    this.transactionCurrentId = 1;
    this.savingsGoalCurrentId = 1;
    this.categoryCurrentId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    
    // Initialize default categories
    this.initializeDefaultCategories();
  }
  
  private initializeDefaultCategories() {
    const defaultCategories: InsertCategory[] = [
      { name: "Housing", icon: "ri-home-4-line", color: "#a78bfa", isDefault: true, type: "expense" },
      { name: "Food", icon: "ri-shopping-basket-2-line", color: "#3b82f6", isDefault: true, type: "expense" },
      { name: "Transportation", icon: "ri-car-line", color: "#f59e0b", isDefault: true, type: "expense" },
      { name: "Entertainment", icon: "ri-film-line", color: "#10b981", isDefault: true, type: "expense" },
      { name: "Utilities", icon: "ri-lightbulb-line", color: "#6366f1", isDefault: true, type: "expense" },
      { name: "Health", icon: "ri-heart-pulse-line", color: "#ec4899", isDefault: true, type: "expense" },
      { name: "Education", icon: "ri-book-open-line", color: "#8b5cf6", isDefault: true, type: "expense" },
      { name: "Other", icon: "ri-more-line", color: "#ef4444", isDefault: true, type: "expense" },
      { name: "Salary", icon: "ri-bank-line", color: "#10b981", isDefault: true, type: "income" },
      { name: "Bonus", icon: "ri-money-dollar-circle-line", color: "#3b82f6", isDefault: true, type: "income" },
      { name: "Investments", icon: "ri-stock-line", color: "#6366f1", isDefault: true, type: "income" },
      { name: "Gifts", icon: "ri-gift-line", color: "#ec4899", isDefault: true, type: "income" },
    ];
    
    for (const category of defaultCategories) {
      this.createCategory(category);
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Transaction operations
  async getTransactions(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (transaction) => transaction.userId === userId,
    ).sort((a, b) => {
      // Sort by date in descending order (newest first)
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }
  
  async getTransactionsByType(userId: number, type: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (transaction) => transaction.userId === userId && transaction.type === type,
    ).sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }
  
  async getTransactionsByCategory(userId: number, category: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (transaction) => transaction.userId === userId && transaction.category === category,
    ).sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }
  
  async getTransactionsByDateRange(userId: number, startDate: Date, endDate: Date): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (transaction) => {
        const transactionDate = new Date(transaction.date);
        return transaction.userId === userId && 
          transactionDate >= startDate && 
          transactionDate <= endDate;
      }
    ).sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }
  
  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }
  
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionCurrentId++;
    const newTransaction: Transaction = { 
      ...transaction, 
      id,
      createdAt: new Date()
    };
    this.transactions.set(id, newTransaction);
    return newTransaction;
  }
  
  async updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const existingTransaction = this.transactions.get(id);
    
    if (!existingTransaction) return undefined;
    
    const updatedTransaction: Transaction = {
      ...existingTransaction,
      ...transaction,
    };
    
    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }
  
  async deleteTransaction(id: number): Promise<boolean> {
    return this.transactions.delete(id);
  }
  
  // Savings Goal operations
  async getSavingsGoals(userId: number): Promise<SavingsGoal[]> {
    return Array.from(this.savingsGoals.values()).filter(
      (goal) => goal.userId === userId,
    );
  }
  
  async getSavingsGoal(id: number): Promise<SavingsGoal | undefined> {
    return this.savingsGoals.get(id);
  }
  
  async createSavingsGoal(goal: InsertSavingsGoal): Promise<SavingsGoal> {
    const id = this.savingsGoalCurrentId++;
    const newGoal: SavingsGoal = { 
      ...goal, 
      id,
      createdAt: new Date()
    };
    this.savingsGoals.set(id, newGoal);
    return newGoal;
  }
  
  async updateSavingsGoal(id: number, goal: Partial<InsertSavingsGoal>): Promise<SavingsGoal | undefined> {
    const existingGoal = this.savingsGoals.get(id);
    
    if (!existingGoal) return undefined;
    
    const updatedGoal: SavingsGoal = {
      ...existingGoal,
      ...goal,
    };
    
    this.savingsGoals.set(id, updatedGoal);
    return updatedGoal;
  }
  
  async deleteSavingsGoal(id: number): Promise<boolean> {
    return this.savingsGoals.delete(id);
  }
  
  // Category operations
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async getCategoriesByType(type: string): Promise<Category[]> {
    return Array.from(this.categories.values()).filter(
      (category) => category.type === type,
    );
  }
  
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.categoryCurrentId++;
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }
}

export const storage = new MemStorage();
