import { db } from "./db";
import {
  users,
  withdrawals,
  transactions,
  type User,
  type InsertUser,
  type Withdrawal,
  type InsertWithdrawal,
  type Transaction
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(id: number, amount: number): Promise<User>;
  activateUser(id: number): Promise<User>;
  
  // Withdrawals
  createWithdrawal(withdrawal: InsertWithdrawal): Promise<Withdrawal>;
  getWithdrawals(userId: number): Promise<Withdrawal[]>;
  
  // Transactions
  createTransaction(userId: number, type: string, amount: number, description: string): Promise<Transaction>;
  getTransactions(userId: number): Promise<Transaction[]>;
  
  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor(sessionStore: any) {
    this.sessionStore = sessionStore;
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserBalance(id: number, amount: number): Promise<User> {
    const user = await this.getUser(id);
    if (!user) throw new Error("User not found");
    
    // Postgres decimal returns string, need to handle careful addition
    const currentBalance = parseFloat(user.balance?.toString() || "0");
    const newBalance = (currentBalance + amount).toFixed(2);
    
    const [updatedUser] = await db
      .update(users)
      .set({ balance: newBalance })
      .where(eq(users.id, id))
      .returning();
      
    return updatedUser;
  }
  
  async activateUser(id: number): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ isActivated: true })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async createWithdrawal(withdrawal: InsertWithdrawal): Promise<Withdrawal> {
    const [newWithdrawal] = await db
      .insert(withdrawals)
      .values(withdrawal)
      .returning();
    return newWithdrawal;
  }

  async getWithdrawals(userId: number): Promise<Withdrawal[]> {
    return await db
      .select()
      .from(withdrawals)
      .where(eq(withdrawals.userId, userId))
      .orderBy(desc(withdrawals.createdAt));
  }

  async createTransaction(userId: number, type: string, amount: number, description: string): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values({
        userId,
        type,
        amount: amount.toString(),
        description
      })
      .returning();
    return transaction;
  }

  async getTransactions(userId: number): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));
  }
}

export const storage = new DatabaseStorage(null);
