import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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

interface BookingConfirmationTemplateProps {
  booking: BookingData;
}

export function BookingConfirmationTemplate({ booking }: BookingConfirmationTemplateProps) {
  const formattedDate = format(booking.date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
  
  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      maxWidth: '600px',
      margin: '0 auto',
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '8px'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#2563eb',
        padding: '32px 24px',
        textAlign: 'center' as const,
        borderRadius: '8px 8px 0 0'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '12px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px'
        }}>
          <span style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>B</span>
        </div>
        <h1 style={{
          color: 'white',
          fontSize: '28px',
          fontWeight: 'bold',
          margin: '0 0 8px 0'
        }}>
          BookingNow
        </h1>
        <p style={{
          color: 'rgba(255, 255, 255, 0.9)',
          fontSize: '16px',
          margin: '0'
        }}>
          Confirmación de Reserva
        </p>
      </div>

      {/* Content */}
      <div style={{ padding: '32px 24px' }}>
        {/* Greeting */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{
            color: '#111827',
            fontSize: '24px',
            fontWeight: 'bold',
            margin: '0 0 16px 0'
          }}>
            ¡Hola {booking.clientName}!
          </h2>
          <p style={{
            color: '#6b7280',
            fontSize: '16px',
            lineHeight: '1.5',
            margin: '0'
          }}>
            Tu reserva ha sido confirmada exitosamente. A continuación encontrarás todos los detalles de tu cita.
          </p>
        </div>

        {/* Booking Details Card */}
        <div style={{
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '24px',
          marginBottom: '32px'
        }}>
          <h3 style={{
            color: '#111827',
            fontSize: '18px',
            fontWeight: '600',
            margin: '0 0 20px 0',
            borderBottom: '2px solid #2563eb',
            paddingBottom: '8px'
          }}>
            Detalles de la Reserva
          </h3>

          {/* Booking ID */}
          <div style={{ marginBottom: '16px' }}>
            <strong style={{ color: '#374151', fontSize: '14px' }}>ID de Reserva:</strong>
            <span style={{ color: '#6b7280', fontSize: '14px', marginLeft: '8px' }}>#{booking.id}</span>
          </div>

          {/* Service */}
          <div style={{ marginBottom: '16px' }}>
            <strong style={{ color: '#374151', fontSize: '14px' }}>Servicio:</strong>
            <span style={{ color: '#6b7280', fontSize: '14px', marginLeft: '8px' }}>{booking.service.name}</span>
          </div>

          {/* Professional */}
          <div style={{ marginBottom: '16px' }}>
            <strong style={{ color: '#374151', fontSize: '14px' }}>Profesional:</strong>
            <span style={{ color: '#6b7280', fontSize: '14px', marginLeft: '8px' }}>{booking.professional.name}</span>
          </div>

          {/* Date and Time */}
          <div style={{ marginBottom: '16px' }}>
            <strong style={{ color: '#374151', fontSize: '14px' }}>Fecha:</strong>
            <span style={{ color: '#6b7280', fontSize: '14px', marginLeft: '8px' }}>{formattedDate}</span>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <strong style={{ color: '#374151', fontSize: '14px' }}>Hora:</strong>
            <span style={{ color: '#6b7280', fontSize: '14px', marginLeft: '8px' }}>{booking.startTime} - {booking.endTime}</span>
          </div>

          {/* Duration */}
          <div style={{ marginBottom: '16px' }}>
            <strong style={{ color: '#374151', fontSize: '14px' }}>Duración:</strong>
            <span style={{ color: '#6b7280', fontSize: '14px', marginLeft: '8px' }}>{booking.service.duration} minutos</span>
          </div>

          {/* Price */}
          <div style={{ marginBottom: '16px' }}>
            <strong style={{ color: '#374151', fontSize: '14px' }}>Precio:</strong>
            <span style={{ color: '#10b981', fontSize: '16px', fontWeight: '600', marginLeft: '8px' }}>
              ${booking.service.price.toLocaleString('es-CO')}
            </span>
          </div>

          {/* Notes */}
          {booking.notes && (
            <div>
              <strong style={{ color: '#374151', fontSize: '14px' }}>Notas:</strong>
              <p style={{ color: '#6b7280', fontSize: '14px', margin: '8px 0 0 0', lineHeight: '1.4' }}>
                {booking.notes}
              </p>
            </div>
          )}
        </div>

        {/* Contact Information */}
        <div style={{
          backgroundColor: '#fef3c7',
          border: '1px solid #fbbf24',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '32px'
        }}>
          <h3 style={{
            color: '#92400e',
            fontSize: '16px',
            fontWeight: '600',
            margin: '0 0 12px 0'
          }}>
            Información de Contacto
          </h3>
          <p style={{
            color: '#92400e',
            fontSize: '14px',
            margin: '0 0 8px 0'
          }}>
            <strong>Empresa:</strong> {booking.tenant.name}
          </p>
          {booking.tenant.email && (
            <p style={{
              color: '#92400e',
              fontSize: '14px',
              margin: '0 0 8px 0'
            }}>
              <strong>Email:</strong> {booking.tenant.email}
            </p>
          )}
          {booking.tenant.phone && (
            <p style={{
              color: '#92400e',
              fontSize: '14px',
              margin: '0'
            }}>
              <strong>Teléfono:</strong> {booking.tenant.phone}
            </p>
          )}
        </div>

        {/* Important Notes */}
        <div style={{
          backgroundColor: '#dbeafe',
          border: '1px solid #3b82f6',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '32px'
        }}>
          <h3 style={{
            color: '#1e40af',
            fontSize: '16px',
            fontWeight: '600',
            margin: '0 0 12px 0'
          }}>
            Información Importante
          </h3>
          <ul style={{
            color: '#1e40af',
            fontSize: '14px',
            margin: '0',
            paddingLeft: '20px',
            lineHeight: '1.5'
          }}>
            <li style={{ marginBottom: '8px' }}>
              Por favor llega 10 minutos antes de tu cita
            </li>
            <li style={{ marginBottom: '8px' }}>
              Si necesitas reprogramar o cancelar, contáctanos con al menos 24 horas de anticipación
            </li>
            <li>
              Guarda este correo como comprobante de tu reserva
            </li>
          </ul>
        </div>

        {/* Footer Message */}
        <div style={{ textAlign: 'center' as const }}>
          <p style={{
            color: '#6b7280',
            fontSize: '16px',
            lineHeight: '1.5',
            margin: '0 0 16px 0'
          }}>
            ¡Gracias por confiar en nosotros!
          </p>
          <p style={{
            color: '#9ca3af',
            fontSize: '14px',
            margin: '0'
          }}>
            Este es un correo automático, por favor no respondas a este mensaje.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        backgroundColor: '#f3f4f6',
        padding: '24px',
        textAlign: 'center' as const,
        borderRadius: '0 0 8px 8px',
        borderTop: '1px solid #e5e7eb'
      }}>
        <p style={{
          color: '#6b7280',
          fontSize: '12px',
          margin: '0'
        }}>
          © 2024 BookingNow. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}

// HTML version for Resend
export function getBookingConfirmationHTML(booking: BookingData): string {
  const formattedDate = format(booking.date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
  
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmación de Reserva - BookingNow</title>
    </head>
    <body style="margin: 0; padding: 20px; background-color: #f9fafb; font-family: Arial, sans-serif;">
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px;">
        <!-- Header -->
        <div style="background-color: #2563eb; padding: 32px 24px; text-align: center; border-radius: 8px 8px 0 0;">
          <div style="width: 48px; height: 48px; background-color: rgba(255, 255, 255, 0.2); border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
            <span style="color: white; font-size: 24px; font-weight: bold;">B</span>
          </div>
          <h1 style="color: white; font-size: 28px; font-weight: bold; margin: 0 0 8px 0;">BookingNow</h1>
          <p style="color: rgba(255, 255, 255, 0.9); font-size: 16px; margin: 0;">Confirmación de Reserva</p>
        </div>

        <!-- Content -->
        <div style="padding: 32px 24px;">
          <!-- Greeting -->
          <div style="margin-bottom: 32px;">
            <h2 style="color: #111827; font-size: 24px; font-weight: bold; margin: 0 0 16px 0;">¡Hola ${booking.clientName}!</h2>
            <p style="color: #6b7280; font-size: 16px; line-height: 1.5; margin: 0;">Tu reserva ha sido confirmada exitosamente. A continuación encontrarás todos los detalles de tu cita.</p>
          </div>

          <!-- Booking Details Card -->
          <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
            <h3 style="color: #111827; font-size: 18px; font-weight: 600; margin: 0 0 20px 0; border-bottom: 2px solid #2563eb; padding-bottom: 8px;">Detalles de la Reserva</h3>

            <div style="margin-bottom: 16px;">
              <strong style="color: #374151; font-size: 14px;">ID de Reserva:</strong>
              <span style="color: #6b7280; font-size: 14px; margin-left: 8px;">#${booking.id}</span>
            </div>

            <div style="margin-bottom: 16px;">
              <strong style="color: #374151; font-size: 14px;">Servicio:</strong>
              <span style="color: #6b7280; font-size: 14px; margin-left: 8px;">${booking.service.name}</span>
            </div>

            <div style="margin-bottom: 16px;">
              <strong style="color: #374151; font-size: 14px;">Profesional:</strong>
              <span style="color: #6b7280; font-size: 14px; margin-left: 8px;">${booking.professional.name}</span>
            </div>

            <div style="margin-bottom: 16px;">
              <strong style="color: #374151; font-size: 14px;">Fecha:</strong>
              <span style="color: #6b7280; font-size: 14px; margin-left: 8px;">${formattedDate}</span>
            </div>

            <div style="margin-bottom: 16px;">
              <strong style="color: #374151; font-size: 14px;">Hora:</strong>
              <span style="color: #6b7280; font-size: 14px; margin-left: 8px;">${booking.startTime} - ${booking.endTime}</span>
            </div>

            <div style="margin-bottom: 16px;">
              <strong style="color: #374151; font-size: 14px;">Duración:</strong>
              <span style="color: #6b7280; font-size: 14px; margin-left: 8px;">${booking.service.duration} minutos</span>
            </div>

            <div style="margin-bottom: 16px;">
              <strong style="color: #374151; font-size: 14px;">Precio:</strong>
              <span style="color: #10b981; font-size: 16px; font-weight: 600; margin-left: 8px;">$${booking.service.price.toLocaleString('es-CO')}</span>
            </div>

            ${booking.notes ? `
            <div>
              <strong style="color: #374151; font-size: 14px;">Notas:</strong>
              <p style="color: #6b7280; font-size: 14px; margin: 8px 0 0 0; line-height: 1.4;">${booking.notes}</p>
            </div>
            ` : ''}
          </div>

          <!-- Contact Information -->
          <div style="background-color: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 20px; margin-bottom: 32px;">
            <h3 style="color: #92400e; font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">Información de Contacto</h3>
            <p style="color: #92400e; font-size: 14px; margin: 0 0 8px 0;"><strong>Empresa:</strong> ${booking.tenant.name}</p>
            ${booking.tenant.email ? `<p style="color: #92400e; font-size: 14px; margin: 0 0 8px 0;"><strong>Email:</strong> ${booking.tenant.email}</p>` : ''}
            ${booking.tenant.phone ? `<p style="color: #92400e; font-size: 14px; margin: 0;"><strong>Teléfono:</strong> ${booking.tenant.phone}</p>` : ''}
          </div>

          <!-- Important Notes -->
          <div style="background-color: #dbeafe; border: 1px solid #3b82f6; border-radius: 8px; padding: 20px; margin-bottom: 32px;">
            <h3 style="color: #1e40af; font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">Información Importante</h3>
            <ul style="color: #1e40af; font-size: 14px; margin: 0; padding-left: 20px; line-height: 1.5;">
              <li style="margin-bottom: 8px;">Por favor llega 10 minutos antes de tu cita</li>
              <li style="margin-bottom: 8px;">Si necesitas reprogramar o cancelar, contáctanos con al menos 24 horas de anticipación</li>
              <li>Guarda este correo como comprobante de tu reserva</li>
            </ul>
          </div>

          <!-- Footer Message -->
          <div style="text-align: center;">
            <p style="color: #6b7280; font-size: 16px; line-height: 1.5; margin: 0 0 16px 0;">¡Gracias por confiar en nosotros!</p>
            <p style="color: #9ca3af; font-size: 14px; margin: 0;">Este es un correo automático, por favor no respondas a este mensaje.</p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f3f4f6; padding: 24px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px; margin: 0;">© 2024 BookingNow. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}