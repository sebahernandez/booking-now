require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

async function testDatabaseConnection() {
  console.log('🔍 Iniciando test de conexión a la base de datos...');
  console.log('📍 URL de la base de datos:', process.env.DATABASE_URL ? 'Configurada ✅' : 'No encontrada ❌');
  
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });

  try {
    console.log('\n🔌 Intentando conectar a la base de datos...');
    
    // Test básico de conexión
    await prisma.$connect();
    console.log('✅ Conexión establecida exitosamente');
    
    // Test de consulta simple
    console.log('\n📊 Ejecutando consulta de prueba...');
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Consulta ejecutada exitosamente:', result);
    
    // Verificar tablas existentes
    console.log('\n📋 Verificando estructura de la base de datos...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    
    if (tables.length > 0) {
      console.log('✅ Tablas encontradas:');
      tables.forEach(table => {
        console.log(`   - ${table.table_name}`);
      });
    } else {
      console.log('⚠️  No se encontraron tablas en la base de datos');
    }
    
    console.log('\n🎉 Test de conexión completado exitosamente');
    
  } catch (error) {
    console.error('❌ Error en la conexión a la base de datos:');
    console.error('Tipo de error:', error.constructor.name);
    console.error('Mensaje:', error.message);
    
    if (error.code) {
      console.error('Código de error:', error.code);
    }
    
    // Sugerencias de solución
    console.log('\n💡 Posibles soluciones:');
    console.log('   1. Verificar que la URL de la base de datos sea correcta');
    console.log('   2. Comprobar que la base de datos esté ejecutándose');
    console.log('   3. Verificar las credenciales de acceso');
    console.log('   4. Revisar la configuración de red/firewall');
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Conexión cerrada');
  }
}

// Ejecutar el test
testDatabaseConnection()
  .catch((error) => {
    console.error('❌ Error inesperado:', error);
    process.exit(1);
  });