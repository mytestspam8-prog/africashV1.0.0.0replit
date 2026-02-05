import { storage } from "./storage";
import { hashPassword } from "./auth";

async function seed() {
  const existingUser = await storage.getUserByEmail("test@africash.com");
  if (!existingUser) {
    console.log("Seeding database...");
    const hashedPassword = await hashPassword("password123");
    const user = await storage.createUser({
      name: "Test User",
      email: "test@africash.com",
      phone: "+241 00 00 00 00",
      password: hashedPassword,
      referralCode: "REF123",
    });
    
    // Add some initial balance
    await storage.updateUserBalance(user.id, 500.00);
    
    // Add some history
    await storage.createTransaction(user.id, "bonus", 500, "Welcome Bonus");
    
    console.log("Database seeded with test user: test@africash.com / password123");
  } else {
    console.log("Database already seeded.");
  }
}

seed().catch(console.error);
