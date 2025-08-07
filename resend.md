Objetivo:
Desarrollar el sistema de notificaciones por correo electrónico en una aplicación de agendamiento de citas multi-tenant construida con Next.js. La aplicación permite a diferentes empresas (tenants) recibir reservas de citas a través de un formulario o wizard específico de cada tenant. Cada cliente gestiona su información de manera aislada y segura.

🧩 Requisitos del Sistema de Notificaciones
📧 Plataforma de envío:
Se utilizará Resend como proveedor de correo transaccional.

El correo de envío provisional será: info@datapro.cl (hasta tener uno corporativo como notifications@bookerfy.cl).

📨 Disparador de notificaciones:
Al completar el formulario de “Agendar Cita” o el Wizard embebido del tenant, se debe enviar una notificación por correo.

El correo debe enviarse al correo electrónico ingresado por el usuario en el formulario.

👤 Personalización:
El contenido del correo debe reflejar el nombre del tenant (empresa donde se agendó la cita).
El diseño del correo debe tener una UI profesional y clara (puede usarse HTML + estilos inline o plantillas compatibles con Resend y React Email).

🔁 Flujo esperado
El usuario completa y envía el formulario de reserva.
Se recopila la información de la cita y el correo electrónico del usuario.
Se genera una plantilla de correo con los datos de la reserva y el branding del tenant.
Se envía el correo desde info@datapro.cl (por ahora) hacia el email del cliente que reservó.
(En el futuro): el correo será enviado desde un dominio corporativo por tenant como notifications@bookerfy.cl.

📦 Consideraciones Técnicas
El sistema debe soportar múltiples tenants, usando su branding e información única en los correos.
Usar una solución como React Email para generar los correos de manera mantenible y escalable.
Separar la lógica de envío en un handler reutilizable, con capacidad de inyectar:
Datos del tenant (nombre, logo, color, etc.).
Información de la cita.
Configuraciones de Resend (API key, dominio verificado).
Preparar un fallback o plantilla general si el tenant no tiene datos personalizados aún.

