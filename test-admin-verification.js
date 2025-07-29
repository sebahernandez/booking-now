import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function testAdminLogin() {
  console.log("🔍 Testing admin login credentials...");
  
  try {
    // Check if admin user exists
    const adminUser = await prisma.user.findFirst({
      where: { email: "admin@booking-now.com" }
    });
    
    if (!adminUser) {
      console.log("❌ Admin user not found with email: admin@booking-now.com");
      return false;
    }
    
    console.log("✅ Admin user found:", {
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role,
      hasPassword: !!adminUser.password
    });
    
    // Test password verification
    if (!adminUser.password) {
      console.log("❌ Admin user has no password set");
      return false;
    }
    
    const passwordMatch = await bcrypt.compare("admin123", adminUser.password);
    
    if (passwordMatch) {
      console.log("✅ Password verification successful");
      console.log("🎉 Admin login test PASSED - credentials are working!");
      return true;
    } else {
      console.log("❌ Password verification failed");
      return false;
    }
    
  } catch (error) {
    console.error("💥 Error testing admin login:", error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

testAdminLogin().then(success => {
  process.exit(success ? 0 : 1);
});