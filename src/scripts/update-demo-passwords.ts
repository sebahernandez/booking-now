import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Updating demo tenant password...');

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

    console.log('✅ Demo tenant password updated successfully');
    console.log('');
    console.log('🎉 Sistema Multi-Tenant Completado!');
    console.log('');
    console.log('Credenciales de prueba:');
    console.log('');
    console.log('1. SUPER ADMINISTRADOR:');
    console.log('   - Email: admin@booking-now.com');
    console.log('   - Password: admin123');
    console.log('   - Dashboard: /admin');
    console.log('   - Funciones: Gestionar todos los tenants y sus datos');
    console.log('');
    console.log('2. CLIENTE/TENANT (Clínica Dental Demo):');
    console.log('   - Email: demo@dental.com');
    console.log('   - Password: demo123');
    console.log('   - Dashboard: /tenant');
    console.log('   - Funciones: Ver solo sus servicios, profesionales y reservas');
    console.log('   - NO ve el menú "Clientes"');
    console.log('');
    console.log('Características implementadas:');
    console.log('✓ Dashboard específico para cada tipo de usuario');
    console.log('✓ Aislamiento total de datos por tenant');
    console.log('✓ Sistema de reservas que muestra solo datos del tenant');
    console.log('✓ Menú adaptativo según rol');
    console.log('✓ Autenticación unificada con redirección automática');
    console.log('✓ Middleware que protege rutas según permisos');

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