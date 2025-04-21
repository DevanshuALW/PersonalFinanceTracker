import { users, transactions, savingsGoals, categories, type User, type InsertUser, type Transaction, type InsertTransaction, type SavingsGoal, type InsertSavingsGoal, type Category, type InsertCategory } from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";
import { pool } from "./db";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

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
  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
    
    // Initialize default categories
    this.initializeDefaultCategories();
  }
  
  private async initializeDefaultCategories() {
    const existingCategories = await this.getCategories();
    
    // Only initialize if there are no categories
    if (existingCategories.length > 0) {
      return;
    }
    
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
      await this.createCategory(category);
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // Transaction operations
  async getTransactions(userId: number): Promise<Transaction[]> {
    return db.select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.date));
  }
  
  async getTransactionsByType(userId: number, type: string): Promise<Transaction[]> {
    return db.select()
      .from(transactions)
      .where(and(
        eq(transactions.userId, userId),
        eq(transactions.type, type)
      ))
      .orderBy(desc(transactions.date));
  }
  
  async getTransactionsByCategory(userId: number, category: string): Promise<Transaction[]> {
    return db.select()
      .from(transactions)
      .where(and(
        eq(transactions.userId, userId),
        eq(transactions.category, category)
      ))
      .orderBy(desc(transactions.date));
  }
  
  async getTransactionsByDateRange(userId: number, startDate: Date, endDate: Date): Promise<Transaction[]> {
    return db.select()
      .from(transactions)
      .where(and(
        eq(transactions.userId, userId),
        sql`${transactions.date} >= ${startDate.toISOString()}`,
        sql`${transactions.date} <= ${endDate.toISOString()}`
      ))
      .orderBy(desc(transactions.date));
  }
  
  async getTransaction(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db.select()
      .from(transactions)
      .where(eq(transactions.id, id));
    return transaction;
  }
  
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db.insert(transactions)
      .values({
        ...transaction,
        createdAt: new Date()
      })
      .returning();
    return newTransaction;
  }
  
  async updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const [updatedTransaction] = await db.update(transactions)
      .set(transaction)
      .where(eq(transactions.id, id))
      .returning();
    return updatedTransaction;
  }
  
  async deleteTransaction(id: number): Promise<boolean> {
    const deleted = await db.delete(transactions)
      .where(eq(transactions.id, id))
      .returning();
    return deleted.length > 0;
  }
  
  // Savings Goal operations
  async getSavingsGoals(userId: number): Promise<SavingsGoal[]> {
    return db.select()
      .from(savingsGoals)
      .where(eq(savingsGoals.userId, userId));
  }
  
  async getSavingsGoal(id: number): Promise<SavingsGoal | undefined> {
    const [goal] = await db.select()
      .from(savingsGoals)
      .where(eq(savingsGoals.id, id));
    return goal;
  }
  
  async createSavingsGoal(goal: InsertSavingsGoal): Promise<SavingsGoal> {
    const [newGoal] = await db.insert(savingsGoals)
      .values({
        ...goal,
        createdAt: new Date()
      })
      .returning();
    return newGoal;
  }
  
  async updateSavingsGoal(id: number, goal: Partial<InsertSavingsGoal>): Promise<SavingsGoal | undefined> {
    const [updatedGoal] = await db.update(savingsGoals)
      .set(goal)
      .where(eq(savingsGoals.id, id))
      .returning();
    return updatedGoal;
  }
  
  async deleteSavingsGoal(id: number): Promise<boolean> {
    const deleted = await db.delete(savingsGoals)
      .where(eq(savingsGoals.id, id))
      .returning();
    return deleted.length > 0;
  }
  
  // Category operations
  async getCategories(): Promise<Category[]> {
    return db.select().from(categories);
  }
  
  async getCategoriesByType(type: string): Promise<Category[]> {
    return db.select()
      .from(categories)
      .where(eq(categories.type, type));
  }
  
  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select()
      .from(categories)
      .where(eq(categories.id, id));
    return category;
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories)
      .values(category)
      .returning();
    return newCategory;
  }
}

export const storage = new DatabaseStorage();
