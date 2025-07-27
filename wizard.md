# Wizard de Reserva de Cita

Este flujo guía al usuario a través de un proceso paso a paso para reservar un servicio disponible en el sistema.

---

## 🟠 Paso 1: Selección del Servicio

El usuario debe seleccionar un **servicio disponible** dentro del sistema. Esta lista puede estar filtrada por categoría, tipo o relevancia.  
Cada servicio puede tener una o más configuraciones de disponibilidad.

---

## 🟡 Paso 2: Selección de Horario Disponible

Basado en el servicio seleccionado en el Paso 1, se muestra un calendario con los días y horarios **disponibles según configuración** del servicio.

### Reglas:

- Cada servicio tiene definidos **días y franjas horarias de atención**.
- Solo se puede seleccionar un horario dentro de esos rangos.
- **Ejemplo**:
  - Si el servicio está disponible los **martes de 10:00 a 12:00 hrs**, solo se podrá seleccionar un horario dentro de ese rango todos los martes en los que **no haya reservas existentes**.
  - Si también está disponible los **sábados de 10:00 a 21:00 hrs**, se mostrarán esas franjas los sábados.
- Los horarios ya reservados se marcarán como **no disponibles**.

---

## 🟢 Paso 3: Selección del Profesional

Una vez definido el servicio y horario, el usuario selecciona un **profesional disponible** que esté **asociado al servicio**.

### Condiciones:

- Solo se muestran los profesionales **vinculados al servicio seleccionado**.
- Se filtran los profesionales que **estén disponibles** en el horario seleccionado.
- Si no hay profesionales disponibles en el horario, se sugiere al usuario volver al paso anterior.

---

## 🔵 Paso 4: Ingreso de Datos del Cliente

El usuario debe ingresar los datos requeridos por el sistema para completar la reserva.

### Campos Requeridos (ejemplo):

- Nombre completo
- Correo electrónico
- Teléfono de contacto
- Comentarios o notas adicionales (opcional)
- Aceptación de términos y condiciones (checkbox)

---

## ✅ Confirmación Final

Una vez completados todos los pasos, se muestra un resumen de:

- Servicio seleccionado
- Día y hora
- Profesional asignado
- Datos del cliente

El usuario debe presionar el botón **“Confirmar Reserva”** para finalizar el proceso.
