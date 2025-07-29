import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function testTenantLogin() {
  console.log("🔍 Testing tenant login functionality...");
  
  try {
    // Get the existing demo tenant
    const demoTenant = await prisma.tenant.findFirst({
      where: { email: "demo@bookingnowtenant.com" }
    });
    
    if (!demoTenant) {
      console.log("❌ Demo tenant not found");
      return false;
    }
    
    console.log("✅ Demo tenant found:", {
      id: demoTenant.id,
      email: demoTenant.email,
      name: demoTenant.name,
      isActive: demoTenant.isActive,
      hasPassword: !!demoTenant.password
    });
    
    // Test password verification
    if (!demoTenant.password) {
      console.log("❌ Demo tenant has no password set");
      return false;
    }
    
    const passwordMatch = await bcrypt.compare("demo123", demoTenant.password);
    
    if (passwordMatch) {
      console.log("✅ Password verification successful for demo tenant");
      console.log("🎉 Tenant login test PASSED!");
      console.log("📋 Demo tenant credentials:");
      console.log("   Email: demo@bookingnowtenant.com");
      console.log("   Password: demo123");
      return true;
    } else {
      console.log("❌ Password verification failed for demo tenant");
      return false;
    }
    
  } catch (error) {
    console.error("💥 Error testing tenant login:", error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

testTenantLogin().then(success => {
  process.exit(success ? 0 : 1);
});