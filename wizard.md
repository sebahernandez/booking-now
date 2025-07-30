Necesito que configures o desarrolles un wizard (widget) para el proceso de agendamiento de citas paso a paso. Cada paso debe tener un propósito claro y mostrar únicamente la información o los campos indicados. No debe mezclarse información entre pasos. El diseño debe ser limpio, intuitivo y centrado en la experiencia del usuario.

🧭 Estructura del wizard: 6 pasos obligatorios


Paso 1: Selección de servicio
Mostrar un campo selector (input select) que despliegue todos los servicios disponibles.

El usuario debe seleccionar uno para continuar.

al seleccionar el servicio debe mostrar el destalle el pa parte inferior del input.

Paso 2: Selección de fecha
Mostrar únicamente un calendario interactivo para que el usuario elija el día en que desea agendar su cita.

El calendario debe estar vinculado al servicio seleccionado en el paso anterior (es decir, debe mostrar sólo los días disponibles para ese servicio).

No mostrar horarios ni profesionales todavía.

Paso 3: Selección de horario
Mostrar los horarios disponibles para el servicio y fecha seleccionados previamente.

Los horarios deben estar filtrados en función de la disponibilidad real del servicio ese día.

Permitir seleccionar solo un horario.

Paso 4: Selección de profesional
Mostrar una lista o selector con los profesionales disponibles para el servicio, día y hora seleccionados.

Puede usarse un campo selector, tarjetas o lista visual, según convenga al diseño.

Solo debe permitirse la selección de un profesional.

Paso 5: Revisión del resumen de la cita
Mostrar un resumen con todos los detalles seleccionados:

Nombre del servicio

Fecha y hora

Profesional asignado

Duración, precio u otros datos del servicio si están disponibles

Este paso es solo de revisión, no editable.

Paso 6: Formulario de contacto y confirmación
Mostrar un formulario donde el usuario debe ingresar sus datos de contacto para confirmar la cita:

Nombre

Email

Teléfono

Observaciones (opcional)

Incluir un botón final de "Reservar cita" que envíe o procese los datos.