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
    const htmlContent = getBookingConfirmationHTML(booking);
    
    const { data, error } = await resend.emails.send({
      from: 'BookingNow <noreply@resend.dev>',
      to: [booking.clientEmail],
      subject: `Confirmación de Reserva #${booking.id} - ${booking.service.name}`,
      html: htmlContent,
      // Fallback text version
      text: `
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

        Información Importante:
        - Por favor llega 10 minutos antes de tu cita
        - Si necesitas reprogramar o cancelar, contáctanos con al menos 24 horas de anticipación
        - Guarda este correo como comprobante de tu reserva

        ¡Gracias por confiar en nosotros!

        BookingNow
        © 2024 BookingNow. Todos los derechos reservados.
      `
    });

    if (error) {
      console.error('Error sending email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log('Email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Email service error:', error);
    throw error;
  }
}

// Optional: Send email to tenant/business owner
export async function sendBookingNotificationToTenant(booking: BookingData) {
  if (!booking.tenant.email) {
    console.log('No tenant email provided, skipping tenant notification');
    return { success: false, reason: 'No tenant email' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'BookingNow <noreply@resend.dev>',
      to: [booking.tenant.email],
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
    });

    if (error) {
      console.error('Error sending tenant notification email:', error);
      throw new Error(`Failed to send tenant notification: ${error.message}`);
    }

    console.log('Tenant notification email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Tenant email service error:', error);
    throw error;
  }
}