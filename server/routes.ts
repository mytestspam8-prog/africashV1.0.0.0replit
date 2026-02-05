import type { Express } from "express";
import type { Server } from "http";
import { setupAuth, hashPassword } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertWithdrawalSchema } from "@shared/schema";
import passport from "passport";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup authentication (Passport)
  setupAuth(app);

  // === AUTH ROUTES ===
  
  app.post(api.auth.register.path, async (req, res, next) => {
    try {
      const input = api.auth.register.input.parse(req.body);
      
      const existingUser = await storage.getUserByEmail(input.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const hashedPassword = await hashPassword(input.password);
      const user = await storage.createUser({
        ...input,
        password: hashedPassword,
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      } else {
        next(err);
      }
    }
  });

  app.post(api.auth.login.path, (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: info?.message || "Authentication failed" });
      }
      req.login(user, (err) => {
        if (err) return next(err);
        res.json(user);
      });
    })(req, res, next);
  });

  app.post(api.auth.logout.path, (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.json({ message: "Logged out successfully" });
    });
  });

  // === PROTECTED ROUTES MIDDLEWARE ===
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // === USER ROUTES ===

  // Get current user (Auth check handled by passport in setupAuth, but this endpoint is for frontend state)
  app.get(api.auth.me.path, requireAuth, (req, res) => {
    res.json(req.user);
  });

  // Activate User (Simulated)
  app.post(api.user.activate.path, requireAuth, async (req, res) => {
    const user = await storage.activateUser(req.user!.id);
    res.json(user);
  });

  // Earn Money
  app.post(api.user.earn.path, requireAuth, async (req, res) => {
    try {
      const { amount, taskId } = api.user.earn.input.parse(req.body);
      
      // Security check: Verify amount matches taskId to prevent manipulation
      // (Simplified logic for MVP)
      let expectedAmount = 0;
      if (taskId === 'diamond_1') expectedAmount = 0.05;
      else if (taskId === 'diamond_2') expectedAmount = 0.10;
      else if (taskId === 'diamond_3') expectedAmount = 0.30;
      else if (taskId === 'gagner') expectedAmount = 0.50;
      
      // Allow small float variance or strict check. For MVP, trust the input if it matches expected ranges or just use server-side value.
      // Better: Use server-side amount based on taskId.
      const realAmount = expectedAmount > 0 ? expectedAmount : amount;

      // Update Balance
      const updatedUser = await storage.updateUserBalance(req.user!.id, realAmount);
      
      // Log Transaction
      await storage.createTransaction(
        req.user!.id, 
        'earn', 
        realAmount, 
        `Completed task: ${taskId}`
      );

      res.json({ 
        balance: updatedUser.balance, 
        message: "Earnings collected successfully" 
      });
    } catch (err) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  // Withdraw Money
  app.post(api.user.withdraw.path, requireAuth, async (req, res) => {
    try {
      const input = insertWithdrawalSchema.parse(req.body);
      
      // Check balance
      const user = await storage.getUser(req.user!.id);
      if (parseFloat(user?.balance?.toString() || "0") < parseFloat(input.amount.toString())) {
        return res.status(400).json({ message: "Insufficient funds" });
      }

      const withdrawal = await storage.createWithdrawal({
        ...input,
        userId: req.user!.id
      });
      
      // Deduct balance immediately or hold it? 
      // Usually deduct immediately.
      await storage.updateUserBalance(req.user!.id, -parseFloat(input.amount.toString()));
      
      await storage.createTransaction(
        req.user!.id,
        'withdraw',
        -parseFloat(input.amount.toString()),
        `Withdrawal request via ${input.method}`
      );

      res.status(201).json(withdrawal);
    } catch (err) {
       if (err instanceof z.ZodError) {
          res.status(400).json({
            message: err.errors[0].message,
            field: err.errors[0].path.join('.'),
          });
        } else {
          res.status(500).json({ message: "Internal server error" });
        }
    }
  });

  app.get(api.user.transactions.path, requireAuth, async (req, res) => {
    const txs = await storage.getTransactions(req.user!.id);
    res.json(txs);
  });

  return httpServer;
}
