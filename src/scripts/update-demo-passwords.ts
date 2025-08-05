import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    // Update demo tenant password
    const hashedPassword = await bcrypt.hash('demo123', 12);
    
    await prisma.tenant.updateMany({
      where: {
        email: 'demo@dental.com'
      },
      data: {
        password: hashedPassword
      }
    });

  } catch (error) {
    console.error('Error updating passwords:', error);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });