import { Resend } from 'resend';
import { getBookingConfirmationHTML } from '@/components/email/booking-confirmation-template';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not defined in environment variables');
}

const resend = new Resend(process.env.RESEND_API_KEY);

interface BookingData {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  date: Date;
  startTime: string;
  endTime: string;
  service: {
    name: string;
    duration: number;
    price: number;
  };
  professional: {
    name: string;
    email?: string;
  };
  tenant: {
    name: string;
    email?: string | null;
    phone?: string | null;
  };
  notes?: string;
}

export async function sendBookingConfirmationEmail(booking: BookingData) {
  try {
    console.log(`📧 Iniciando envío ASÍNCRONO SECUENCIAL para reserva #${booking.id}`);
    
    const tenantEmailTo = ['info@datapro.cl']; // Administrador
    const clientEmailTo = [booking.clientEmail]; // Cliente
    
    // PASO 1: Email al ADMINISTRADOR (notificación de nueva reserva)
    const adminHtmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nueva Reserva #${booking.id} - BookingNow</title>
      </head>
      <body style="margin: 0; padding: 20px; background-color: #f9fafb; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 32px;">
          <h1 style="color: #111827; font-size: 24px; font-weight: bold; margin-bottom: 20px;">🔔 Nueva Reserva Recibida #${booking.id}</h1>
          
          <div style="background-color: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
            <h2 style="color: #0c4a6e; font-size: 18px; margin-bottom: 16px;">Información del Cliente</h2>
            <p style="margin: 8px 0;"><strong>Nombre:</strong> ${booking.clientName}</p>
            <p style="margin: 8px 0;"><strong>Email:</strong> ${booking.clientEmail}</p>
            <p style="margin: 8px 0;"><strong>Teléfono:</strong> ${booking.clientPhone}</p>
          </div>

          <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
            <h2 style="color: #111827; font-size: 18px; margin-bottom: 16px;">Detalles de la Reserva</h2>
            <p style="margin: 8px 0;"><strong>ID:</strong> #${booking.id}</p>
            <p style="margin: 8px 0;"><strong>Servicio:</strong> ${booking.service.name}</p>
            <p style="margin: 8px 0;"><strong>Profesional:</strong> ${booking.professional.name}</p>
            <p style="margin: 8px 0;"><strong>Fecha:</strong> ${booking.date.toLocaleDateString('es-CO')}</p>
            <p style="margin: 8px 0;"><strong>Hora:</strong> ${booking.startTime} - ${booking.endTime}</p>
            <p style="margin: 8px 0;"><strong>Duración:</strong> ${booking.service.duration} minutos</p>
            <p style="margin: 8px 0;"><strong>Precio:</strong> $${booking.service.price.toLocaleString('es-CO')}</p>
            ${booking.notes ? `<p style="margin: 8px 0;"><strong>Notas:</strong> ${booking.notes}</p>` : ''}
          </div>

          <div style="background-color: #fef7cd; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <h3 style="color: #92400e; font-size: 16px; margin-bottom: 8px;">📍 Información de Contacto Adicional</h3>
            <p style="margin: 4px 0; color: #92400e;"><strong>Empresa:</strong> ${booking.tenant.name}</p>
            ${booking.tenant.email ? `<p style="margin: 4px 0; color: #92400e;"><strong>Email de contacto:</strong> ${booking.tenant.email}</p>` : ''}
            ${booking.tenant.phone ? `<p style="margin: 4px 0; color: #92400e;"><strong>Teléfono:</strong> ${booking.tenant.phone}</p>` : ''}
          </div>

          <p style="color: #6b7280; font-size: 14px; margin-top: 24px; text-align: center;">
            📧 Notificación para el administrador<br>
            <strong>BookingNow</strong> - Sistema de Reservas
          </p>
        </div>
      </body>
      </html>
    `;

    const adminEmailConfig = {
      from: 'BookingNow <onboarding@resend.dev>',
      to: tenantEmailTo,
      subject: `🔔 Nueva Reserva #${booking.id} - ${booking.service.name} (${booking.clientName})`,
      html: adminHtmlContent,
      text: `Nueva Reserva Recibida - BookingNow\n\nCliente: ${booking.clientName} (${booking.clientEmail})\nReserva: #${booking.id} - ${booking.service.name}\nFecha: ${booking.date.toLocaleDateString('es-CO')} ${booking.startTime}-${booking.endTime}\nPrecio: $${booking.service.price.toLocaleString('es-CO')}\n\nBookingNow - Sistema de Reservas`
    };

    console.log(`📧 PASO 1/2: Enviando notificación al administrador: ${tenantEmailTo[0]}`);
    console.log(`🔍 [EMAIL-DEBUG] TO (administrador):`, tenantEmailTo);
    
    const adminResult = await resend.emails.send(adminEmailConfig);

    if (adminResult.error) {
      console.error('❌ Error sending admin notification email:', adminResult.error);
      throw new Error(`Failed to send admin notification: ${JSON.stringify(adminResult.error)}`);
    }

    console.log(`✅ PASO 1/2 completado - Notificación enviada al administrador: ${adminResult.data?.id}`);

    // PAUSA ASÍNCRONA DE 10 SEGUNDOS
    console.log(`⏱️  Esperando 10 segundos antes del envío al cliente...`);
    await new Promise(resolve => setTimeout(resolve, 10000));

    // PASO 2: Email al CLIENTE (confirmación de reserva)
    const clientHtmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmación Reserva #${booking.id}</title>
      </head>
      <body style="margin: 0; padding: 20px; background-color: #f0f9ff; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 32px;">
          <h1 style="color: #0c4a6e; font-size: 24px; font-weight: bold; margin-bottom: 20px;">✅ ¡Tu Reserva ha sido Confirmada!</h1>
          
          <p style="color: #1e40af; font-size: 16px; margin-bottom: 24px;">Hola <strong>${booking.clientName}</strong>,</p>
          <p style="color: #374151; font-size: 16px; margin-bottom: 24px;">Tu reserva ha sido confirmada exitosamente. A continuación encontrarás todos los detalles:</p>

          <div style="background-color: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
            <h2 style="color: #0c4a6e; font-size: 18px; margin-bottom: 16px;">📋 Detalles de tu Reserva</h2>
            <p style="margin: 8px 0;"><strong>ID de Reserva:</strong> #${booking.id}</p>
            <p style="margin: 8px 0;"><strong>Servicio:</strong> ${booking.service.name}</p>
            <p style="margin: 8px 0;"><strong>Profesional:</strong> ${booking.professional.name}</p>
            <p style="margin: 8px 0;"><strong>Fecha:</strong> ${booking.date.toLocaleDateString('es-CO')}</p>
            <p style="margin: 8px 0;"><strong>Hora:</strong> ${booking.startTime} - ${booking.endTime}</p>
            <p style="margin: 8px 0;"><strong>Duración:</strong> ${booking.service.duration} minutos</p>
            <p style="margin: 8px 0;"><strong>Precio:</strong> $${booking.service.price.toLocaleString('es-CO')}</p>
            ${booking.notes ? `<p style="margin: 8px 0;"><strong>Notas:</strong> ${booking.notes}</p>` : ''}
          </div>

          <div style="background-color: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <h3 style="color: #047857; font-size: 16px; margin-bottom: 8px;">📞 Información de Contacto</h3>
            <p style="margin: 4px 0; color: #047857;"><strong>Empresa:</strong> ${booking.tenant.name}</p>
            ${booking.tenant.email ? `<p style="margin: 4px 0; color: #047857;"><strong>Email:</strong> ${booking.tenant.email}</p>` : ''}
            ${booking.tenant.phone ? `<p style="margin: 4px 0; color: #047857;"><strong>Teléfono:</strong> ${booking.tenant.phone}</p>` : ''}
          </div>

          <p style="color: #6b7280; font-size: 14px; margin-top: 24px; text-align: center;">
            ¡Gracias por confiar en nosotros!<br>
            <strong>BookingNow</strong> - Sistema de Reservas
          </p>
        </div>
      </body>
      </html>
    `;

    const clientEmailConfig = {
      from: 'BookingNow <onboarding@resend.dev>',
      to: clientEmailTo,
      subject: `✅ Confirmación de Reserva #${booking.id} - ${booking.service.name}`,
      html: clientHtmlContent,
      text: `¡Tu Reserva ha sido Confirmada!\n\nHola ${booking.clientName},\n\nTu reserva #${booking.id} ha sido confirmada exitosamente.\n\nDetalles:\n- Servicio: ${booking.service.name}\n- Profesional: ${booking.professional.name}\n- Fecha: ${booking.date.toLocaleDateString('es-CO')} ${booking.startTime}-${booking.endTime}\n- Precio: $${booking.service.price.toLocaleString('es-CO')}\n\n¡Gracias por confiar en nosotros!\nBookingNow`
    };

    console.log(`📧 PASO 2/2: Enviando confirmación al cliente: ${booking.clientEmail}`);
    console.log(`🔍 [EMAIL-DEBUG] TO (cliente):`, clientEmailTo);
    
    const clientResult = await resend.emails.send(clientEmailConfig);

    if (clientResult.error) {
      console.error('❌ Error sending client confirmation email:', clientResult.error);
      console.log('⚠️  Email al administrador fue enviado exitosamente, pero falló el email al cliente');
      return { 
        success: true, 
        data: {
          admin: adminResult.data,
          client: null
        },
        warning: 'Admin notification sent successfully, but client confirmation failed'
      };
    }

    console.log(`✅ PASO 2/2 completado - Confirmación enviada al cliente: ${clientResult.data?.id}`);
    
    return { 
      success: true, 
      data: {
        admin: adminResult.data,
        client: clientResult.data
      },
      timing: 'Sequential emails sent with 10-second delay'
    };
  } catch (error) {
    console.error('❌ Email service error:', error);
    throw error;
  }
}

// Optional: Send email to tenant/business owner
export async function sendBookingNotificationToTenant(booking: BookingData) {
  try {
    console.log(`📧 Enviando notificación de reserva #${booking.id} al administrador: info@datapro.cl`);
    console.log(`🔍 [EMAIL-DEBUG] booking.tenant.email (solo info de contacto):`, booking.tenant.email);
    console.log(`🔍 [EMAIL-DEBUG] booking.clientEmail (cliente real):`, booking.clientEmail);
    
    // SIEMPRE enviar al administrador/dueño del sistema
    // booking.tenant.email es solo información de contacto del cliente, NO destinatario
    const tenantEmailTo = ['info@datapro.cl'];
    console.log(`🔍 [EMAIL-DEBUG] Variable tenantEmailTo (administrador):`, tenantEmailTo);
    
    const tenantEmailConfig = {
      from: 'BookingNow <onboarding@resend.dev>',
      to: tenantEmailTo,
      subject: `Nueva Reserva Recibida #${booking.id} - ${booking.service.name}`,
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Nueva Reserva - BookingNow</title>
        </head>
        <body style="margin: 0; padding: 20px; background-color: #f9fafb; font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 32px;">
            <h1 style="color: #111827; font-size: 24px; font-weight: bold; margin-bottom: 20px;">🔔 Nueva Reserva Recibida</h1>
            
            <div style="background-color: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
              <h2 style="color: #0c4a6e; font-size: 18px; margin-bottom: 16px;">Detalles del Cliente</h2>
              <p style="margin: 8px 0;"><strong>Nombre:</strong> ${booking.clientName}</p>
              <p style="margin: 8px 0;"><strong>Email:</strong> ${booking.clientEmail}</p>
              <p style="margin: 8px 0;"><strong>Teléfono:</strong> ${booking.clientPhone}</p>
            </div>

            <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
              <h2 style="color: #111827; font-size: 18px; margin-bottom: 16px;">Detalles de la Reserva</h2>
              <p style="margin: 8px 0;"><strong>ID:</strong> #${booking.id}</p>
              <p style="margin: 8px 0;"><strong>Servicio:</strong> ${booking.service.name}</p>
              <p style="margin: 8px 0;"><strong>Profesional:</strong> ${booking.professional.name}</p>
              <p style="margin: 8px 0;"><strong>Fecha:</strong> ${booking.date.toLocaleDateString('es-CO')}</p>
              <p style="margin: 8px 0;"><strong>Hora:</strong> ${booking.startTime} - ${booking.endTime}</p>
              <p style="margin: 8px 0;"><strong>Duración:</strong> ${booking.service.duration} minutos</p>
              <p style="margin: 8px 0;"><strong>Precio:</strong> $${booking.service.price.toLocaleString('es-CO')}</p>
              ${booking.notes ? `<p style="margin: 8px 0;"><strong>Notas:</strong> ${booking.notes}</p>` : ''}
            </div>

            <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
              📧 Esta notificación se envía al administrador cuando se recibe una nueva reserva a través de BookingNow.
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
        Nueva Reserva Recibida

        Cliente:
        - Nombre: ${booking.clientName}
        - Email: ${booking.clientEmail}
        - Teléfono: ${booking.clientPhone}

        Reserva:
        - ID: #${booking.id}
        - Servicio: ${booking.service.name}
        - Profesional: ${booking.professional.name}
        - Fecha: ${booking.date.toLocaleDateString('es-CO')}
        - Hora: ${booking.startTime} - ${booking.endTime}
        - Duración: ${booking.service.duration} minutos
        - Precio: $${booking.service.price.toLocaleString('es-CO')}
        ${booking.notes ? `- Notas: ${booking.notes}` : ''}
      `
    };

    console.log(`🔍 [EMAIL-DEBUG] Configuración completa tenantEmailConfig:`, {
      from: tenantEmailConfig.from,
      to: tenantEmailConfig.to,
      subject: tenantEmailConfig.subject
    });

    const { data, error } = await resend.emails.send(tenantEmailConfig);

    if (error) {
      console.error('❌ Error sending tenant notification email:', error);
      throw new Error(`Failed to send tenant notification: ${JSON.stringify(error)}`);
    }

    console.log(`✅ Email de administrador enviado exitosamente:`, {
      emailId: data?.id,
      to: tenantEmailConfig.to,
      clientContactEmail: booking.tenant.email // Solo para referencia
    });

    return { success: true, data };
  } catch (error) {
    console.error('❌ Tenant email service error:', error);
    throw error;
  }
}