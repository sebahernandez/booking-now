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
    console.log(`📧 [WORKAROUND] Enviando confirmación de reserva #${booking.id} con emails separados`);
    
    const htmlContent = getBookingConfirmationHTML(booking);
    const textContent = `
        Hola ${booking.clientName},

        Tu reserva ha sido confirmada exitosamente.

        Detalles de la Reserva:
        - ID: #${booking.id}
        - Servicio: ${booking.service.name}
        - Profesional: ${booking.professional.name}
        - Fecha: ${booking.date.toLocaleDateString('es-CO')}
        - Hora: ${booking.startTime} - ${booking.endTime}
        - Duración: ${booking.service.duration} minutos
        - Precio: $${booking.service.price.toLocaleString('es-CO')}
        ${booking.notes ? `- Notas: ${booking.notes}` : ''}

        Información de Contacto:
        - Empresa: ${booking.tenant.name}
        ${booking.tenant.email ? `- Email: ${booking.tenant.email}` : ''}
        ${booking.tenant.phone ? `- Teléfono: ${booking.tenant.phone}` : ''}

        ¡Gracias por confiar en nosotros!
        BookingNow
      `;

    // Email 1: A info@datapro.cl
    const businessEmailConfig = {
      from: 'BookingNow <onboarding@resend.dev>',
      to: ['info@datapro.cl'],
      subject: `Nueva Reserva #${booking.id} - ${booking.service.name} (${booking.clientName})`,
      html: htmlContent,
      text: textContent
    };

    console.log(`📧 Enviando email 1/2 a negocio: info@datapro.cl`);
    const businessResult = await resend.emails.send(businessEmailConfig);

    if (businessResult.error) {
      console.error('❌ Error sending business email:', businessResult.error);
      throw new Error(`Failed to send business email: ${businessResult.error.message}`);
    }

    console.log(`✅ Email 1/2 enviado a negocio: ${businessResult.data?.id}`);

    // Email 2: Al cliente
    const clientEmailConfig = {
      from: 'BookingNow <onboarding@resend.dev>',
      to: [booking.clientEmail],
      subject: `Confirmación de Reserva #${booking.id} - ${booking.service.name}`,
      html: htmlContent,
      text: textContent
    };

    console.log(`📧 Enviando email 2/2 al cliente: ${booking.clientEmail}`);
    const clientResult = await resend.emails.send(clientEmailConfig);

    if (clientResult.error) {
      console.error('❌ Error sending client email:', clientResult.error);
      console.log('⚠️  Email al negocio fue enviado exitosamente, pero falló el email al cliente');
      // No lanzar error aquí, ya que al menos el negocio recibió la notificación
    } else {
      console.log(`✅ Email 2/2 enviado al cliente: ${clientResult.data?.id}`);
    }

    return { 
      success: true, 
      data: {
        business: businessResult.data,
        client: clientResult.data
      }
    };
  } catch (error) {
    console.error('❌ Email service error:', error);
    throw error;
  }
}

// Optional: Send email to tenant/business owner
export async function sendBookingNotificationToTenant(booking: BookingData) {
  try {
    console.log(`📧 Enviando notificación de reserva #${booking.id} al tenant`);
    
    // Usar la misma configuración: info@datapro.cl como destinatario principal
    const tenantEmailConfig = {
      from: 'BookingNow <onboarding@resend.dev>',
      to: ['info@datapro.cl',booking.tenant.email], // Destinatario principal (cuenta verificada)
      cc: booking.tenant.email ? [booking.tenant.email] : [], // Copia al tenant si tiene email
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
            <h1 style="color: #111827; font-size: 24px; font-weight: bold; margin-bottom: 20px;">Nueva Reserva Recibida</h1>
            
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
              Esta notificación se envía automáticamente cuando se recibe una nueva reserva a través de BookingNow.
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

    console.log(`📧 Configuración de email tenant:`, {
      from: tenantEmailConfig.from,
      to: tenantEmailConfig.to,
      cc: tenantEmailConfig.cc,
      subject: tenantEmailConfig.subject
    });

    const { data, error } = await resend.emails.send(tenantEmailConfig);

    if (error) {
      console.error('❌ Error sending tenant notification email:', error);
      throw new Error(`Failed to send tenant notification: ${error.message}`);
    }

    console.log(`✅ Email de tenant enviado exitosamente:`, {
      emailId: data?.id,
      to: tenantEmailConfig.to,
      cc: tenantEmailConfig.cc
    });

    return { success: true, data };
  } catch (error) {
    console.error('❌ Tenant email service error:', error);
    throw error;
  }
}