require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

async function testDatabaseConnection() {
  const prisma = new PrismaClient({
    log: ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });

  try {
    // Test básico de conexión
    await prisma.$connect();
    
    // Test de consulta simple
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    
    // Verificar tablas existentes
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    
  } catch (error) {
    console.error('❌ Error en la conexión a la base de datos:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el test
testDatabaseConnection()
  .catch((error) => {
    console.error('❌ Error inesperado:', error);
    process.exit(1);
  });