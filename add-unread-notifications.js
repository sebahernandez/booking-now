const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addUnreadNotifications() {
  try {
    // Obtener el primer tenant
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) {
      return;
    }
    
    // Limpiar notificaciones existentes
    await prisma.$executeRaw`DELETE FROM notifications WHERE "tenantId" = ${tenant.id}`;
    
    // Agregar notificaciones no leídas para probar el comportamiento estilo Facebook
    await prisma.$executeRaw`
      INSERT INTO notifications (id, "tenantId", type, title, message, read, "createdAt", "updatedAt")
      VALUES 
        (gen_random_uuid(), ${tenant.id}, 'NEW_BOOKING', 'Nueva reserva de María González', 'María González ha reservado Corte de cabello para el 06/08/2025 a las 14:30', false, now() - INTERVAL '5 minutes', now() - INTERVAL '5 minutes'),
        (gen_random_uuid(), ${tenant.id}, 'NEW_BOOKING', 'Nueva reserva de Carlos Silva', 'Carlos Silva ha reservado Tratamiento facial para el 07/08/2025 a las 10:00', false, now() - INTERVAL '1 hour', now() - INTERVAL '1 hour'),
        (gen_random_uuid(), ${tenant.id}, 'NEW_BOOKING', 'Nueva reserva de Ana López', 'Ana López ha reservado Masaje relajante para el 08/08/2025 a las 16:30', false, now() - INTERVAL '2 hours', now() - INTERVAL '2 hours'),
        (gen_random_uuid(), ${tenant.id}, 'BOOKING_UPDATED', 'Reserva actualizada', 'La reserva de Pedro Martín ha sido confirmada', false, now() - INTERVAL '3 hours', now() - INTERVAL '3 hours')
    `;
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addUnreadNotifications();
