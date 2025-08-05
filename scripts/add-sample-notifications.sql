-- Script para agregar notificaciones de ejemplo
-- Ejecutar en la consola de Supabase o herramienta de base de datos

-- Insertar notificaciones de ejemplo para el primer tenant
INSERT INTO notifications (id, tenant_id, type, title, message, read, created_at, updated_at)
VALUES 
  (gen_random_uuid(), (SELECT id FROM tenants LIMIT 1), 'NEW_BOOKING', 'Nueva reserva creada', 'Juan Pérez ha reservado Corte de cabello para el 05/08/2025 a las 14:30', false, now() - INTERVAL '5 minutes', now() - INTERVAL '5 minutes'),
  (gen_random_uuid(), (SELECT id FROM tenants LIMIT 1), 'NEW_BOOKING', 'Nueva reserva creada', 'María González ha reservado Tratamiento facial para el 06/08/2025 a las 10:00', false, now() - INTERVAL '2 hours', now() - INTERVAL '2 hours'),
  (gen_random_uuid(), (SELECT id FROM tenants LIMIT 1), 'BOOKING_UPDATED', 'Reserva actualizada', 'La reserva de Carlos Silva para Masaje relajante ha sido confirmada', true, now() - INTERVAL '1 day', now() - INTERVAL '1 day'),
  (gen_random_uuid(), (SELECT id FROM tenants LIMIT 1), 'NEW_BOOKING', 'Nueva reserva creada', 'Ana López ha reservado Manicure para el 07/08/2025 a las 16:00', false, now() - INTERVAL '30 minutes', now() - INTERVAL '30 minutes');
