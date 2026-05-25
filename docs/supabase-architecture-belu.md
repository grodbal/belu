# Arquitectura Supabase para belu ✦

## Objetivo

Este documento define la estructura futura de datos para belu, una plataforma web de belleza a domicilio especializada en lashes y nails.

La finalidad es conectar más adelante el panel de clienta, el panel de Beluer y el panel admin con Supabase, sin rehacer la interfaz actual.

---

## Rutas principales del sistema

```txt
/app/clienta
/app/beluer
/app/admin
```

### /app/clienta

La clienta podrá:

- Ver su dashboard.
- Crear una nueva reserva.
- Elegir servicios.
- Elegir add-ons.
- Elegir modo gestionado o libre.
- Seleccionar Beluer si usa modo libre.
- Pagar.
- Ver su reserva activa.
- Reprogramar.
- Cambiar Beluer.
- Cancelar reserva.
- Ver especialistas.
- Guardar favoritas.
- Ver historial.
- Ver pagos.
- Editar perfil.

### /app/beluer

La Beluer podrá:

- Ver sus reservas asignadas.
- Aceptar o rechazar solicitudes según disponibilidad.
- Editar su perfil público.
- Subir foto de perfil.
- Subir fotos de portafolio.
- Seleccionar servicios que realiza.
- Definir precios por servicio.
- Definir zonas de atención.
- Actualizar disponibilidad.
- Ver ingresos generados.
- Ver historial de servicios realizados.
- Ver reviews recibidas.

### /app/admin

El equipo de belu podrá:

- Aprobar o rechazar Beluers.
- Validar fotos y portafolio.
- Crear, editar o desactivar servicios.
- Definir precio mínimo por servicio.
- Ver reservas.
- Ver pagos.
- Ver comisiones.
- Ver métricas.
- Gestionar reclamos.
- Gestionar niveles de Beluer.
- Activar o desactivar perfiles.

---

## Tablas principales

### 1. profiles

Tabla base para usuarios autenticados.

```txt
id
auth_user_id
role
full_name
email
phone
created_at
updated_at
```

Roles posibles:

```txt
clienta
beluer
admin
```

Uso:

- Centraliza la información base del usuario.
- Permite distinguir si el usuario es clienta, Beluer o admin.
- Se relaciona con `client_profiles` o `beluer_profiles` según el rol.

---

### 2. client_profiles

Información específica de clientas.

```txt
id
profile_id
district
main_address
beauty_preference
whatsapp_notifications_enabled
day_21_reminder_enabled
created_at
updated_at
```

Uso:

- Guarda distrito principal.
- Guarda dirección frecuente.
- Guarda preferencia de belleza.
- Activa o desactiva recordatorios por WhatsApp.
- Activa o desactiva recordatorio de retoque del día 21.

---

### 3. beluer_profiles

Información principal de cada Beluer.

```txt
id
profile_id
public_name
bio
instagram
phone
profile_photo_url
districts
experience_years
level
status
rating_average
total_bookings
created_at
updated_at
```

Niveles posibles:

```txt
nueva
verificada
top
```

Estados posibles:

```txt
pending_review
approved
rejected
paused
disabled
```

Uso:

- Guarda el perfil visible de cada Beluer.
- Permite aprobar o pausar perfiles.
- Permite mostrar badges como Beluer Nueva, Beluer Verificada o Beluer Top ✦.
- Permite controlar si una Beluer aparece o no en el catálogo.

---

### 4. services

Catálogo general de servicios belu.

```txt
id
name
category
description
minimum_price
estimated_duration_minutes
image_url
is_active
created_at
updated_at
```

Categorías posibles:

```txt
lashes
nails
brows
addon
```

Ejemplos:

```txt
Clásicas
Efecto Rímel
Volumen 3D
Volumen 4D
Mega Volumen 5D
Efecto Whispy
Efecto Aura
Lifting de pestañas
Planchado de cejas
Esmaltado Gel
Rubber
Gel de Construcción
Acrílicas
Polygel
Softgel
Manicura Tradicional
Pedicura Tradicional
Pedicura Gel
Acripie
```

Uso:

- Define el catálogo maestro.
- Permite activar o desactivar servicios.
- Define precios mínimos para proteger el posicionamiento premium.
- No define necesariamente el precio final de cada Beluer.

---

### 5. beluer_services

Relación entre Beluer y servicios que realiza.

```txt
id
beluer_id
service_id
price
duration_minutes
is_active
created_at
updated_at
```

Uso:

- Permite que cada Beluer seleccione qué servicios realiza.
- Permite que cada Beluer defina su propio precio por servicio.
- Permite ocultar un servicio específico para una Beluer sin eliminarlo del catálogo general.

Ejemplo:

```txt
Camila V. - Efecto Rímel - S/ 120
Andrea Robles - Volumen 3D - S/ 150
Sofía T. - Rubber - S/ 90
```

---

### 6. service_addons

Servicios adicionales disponibles.

```txt
id
name
category
description
price
is_active
created_at
updated_at
```

Ejemplos:

```txt
Depilación con cera
Depilación con hilo
Depilación con navaja
Retiro de extensiones
Diseño de cejas con henna
Retiro de gel
Retiro Rubber/Builder Gel
Retiro Acrílico/Polygel
```

Uso:

- Guarda add-ons disponibles.
- Permite mostrar adicionales según categoría.
- Permite sumar adicionales al total de una reserva.

---

### 7. beluer_photos

Portafolio de cada Beluer.

```txt
id
beluer_id
image_url
category
caption
is_cover
is_approved
created_at
updated_at
```

Categorías posibles:

```txt
lashes
nails
brows
profile
workspace
result
```

Uso:

- Guarda fotos del portafolio.
- Permite que la Beluer suba fotos desde su panel.
- Permite que admin apruebe o rechace imágenes antes de publicarlas.
- Permite definir una foto como portada.

---

### 8. beluer_availability

Disponibilidad de cada Beluer.

```txt
id
beluer_id
day_of_week
start_time
end_time
is_available
created_at
updated_at
```

Uso:

- Define horarios de atención por día.
- Permite filtrar Beluers disponibles.
- Más adelante puede conectarse con reservas reales para bloquear horarios ocupados.

---

### 9. bookings

Reservas principales.

```txt
id
client_id
beluer_id
assignment_mode
status
scheduled_date
scheduled_time
district
address
instructions
subtotal
logistics_fee
express_fee
total
payment_status
created_at
updated_at
```

Modos de asignación:

```txt
gestionado
libre
```

Estados de reserva:

```txt
pending_payment
paid
pending_beluer_assignment
assigned
confirmed
in_progress
completed
cancelled
rescheduled
refunded
```

Uso:

- Guarda la reserva principal.
- Define si la reserva fue en modo gestionado o libre.
- Guarda fecha, hora, dirección, total y estado.
- Sirve como base para pagos, servicios, add-ons, reseñas y automatizaciones.

---

### 10. booking_services

Servicios incluidos en una reserva.

```txt
id
booking_id
service_id
beluer_service_id
name_snapshot
price_snapshot
created_at
```

Uso:

- Guarda los servicios elegidos en una reserva.
- Usa snapshot para conservar el nombre y precio exacto al momento de pago.
- Evita que cambios futuros de precio alteren reservas antiguas.

---

### 11. booking_addons

Add-ons incluidos en una reserva.

```txt
id
booking_id
addon_id
name_snapshot
price_snapshot
created_at
```

Uso:

- Guarda adicionales elegidos por la clienta.
- Conserva precio exacto al momento de reserva.

---

### 12. payments

Pagos realizados por clientas.

```txt
id
booking_id
client_id
provider
method
status
amount
currency
transaction_id
receipt_url
paid_at
created_at
updated_at
```

Proveedores posibles:

```txt
culqi
niubiz
manual
```

Métodos posibles:

```txt
card
yape
plin
```

Estados posibles:

```txt
pending
paid
failed
refunded
partially_refunded
```

Uso:

- Guarda pagos reales.
- Se conecta con Culqi o Niubiz.
- Permite mostrar historial de pagos y comprobantes.
- Permite controlar reembolsos.

---

### 13. favorites

Beluers favoritas por clienta.

```txt
id
client_id
beluer_id
created_at
```

Uso:

- Guarda qué Beluers marcó como favoritas cada clienta.
- Alimenta la sección Favoritas del panel de clienta.

---

### 14. reviews

Reseñas después del servicio.

```txt
id
booking_id
client_id
beluer_id
rating
comment
created_at
```

Uso:

- Guarda calificaciones y comentarios.
- Alimenta rating promedio de la Beluer.
- Puede activarse 30 minutos después del servicio mediante n8n.

---

### 15. beluer_earnings

Ingresos de Beluer por reserva.

```txt
id
booking_id
beluer_id
gross_amount
platform_commission_percentage
platform_commission_amount
net_amount
payout_status
created_at
updated_at
```

Estados de payout:

```txt
pending
scheduled
paid
held
cancelled
```

Uso:

- Calcula ingresos por reserva.
- Calcula comisión de belu.
- Calcula neto a pagar a la Beluer.
- Alimenta el futuro panel de ingresos de la Beluer.

---

### 16. automations_log

Registro de automatizaciones disparadas por n8n.

```txt
id
booking_id
automation_type
status
sent_at
payload
error_message
created_at
```

Tipos de automatización:

```txt
booking_created
beluer_channel_notification
client_beluer_assigned
booking_reminder_24h
review_request_30min
day_21_retouch_reminder
booking_cancelled
booking_rescheduled
```

Uso:

- Registra mensajes y automatizaciones.
- Permite auditar si una notificación se envió o falló.
- Ayuda a depurar flujos de n8n.

---

## Storage

Se usará Supabase Storage para imágenes.

Buckets sugeridos:

```txt
beluer-profile-photos
beluer-portfolio
service-images
review-images
client-uploads
```

Estructura sugerida:

```txt
beluer-portfolio/
  beluer-id/
    lashes-001.jpg
    lashes-002.jpg
    nails-001.jpg
```

Uso:

- Guardar fotos de perfil de Beluers.
- Guardar portafolio de trabajos.
- Guardar imágenes de servicios.
- Guardar imágenes asociadas a reseñas.
- Guardar archivos o imágenes que la clienta pueda subir más adelante.

---

## Seguridad y permisos RLS

RLS significa Row Level Security. Es el sistema de permisos de Supabase para controlar qué puede leer, crear o modificar cada usuario.

### Clienta

Puede:

- Leer y editar su propio perfil.
- Leer Beluers aprobadas.
- Leer servicios activos.
- Crear reservas propias.
- Leer sus propias reservas.
- Leer sus propios pagos.
- Crear y eliminar sus favoritas.
- Crear reviews de sus reservas completadas.

No puede:

- Editar Beluers.
- Ver reservas de otras clientas.
- Ver pagos de otras clientas.
- Cambiar estados internos de reservas.
- Aprobar Beluers.
- Ver ingresos de Beluers.

---

### Beluer

Puede:

- Leer y editar su propio perfil.
- Subir fotos a su propio portafolio.
- Editar sus servicios y precios.
- Editar su disponibilidad.
- Ver reservas asignadas a ella.
- Ver sus ingresos.
- Ver reviews recibidas.

No puede:

- Editar otras Beluers.
- Ver pagos completos de clientas.
- Cambiar comisiones.
- Aprobarse a sí misma.
- Cambiar su estado de verificación.
- Ver información privada de otras Beluers.

---

### Admin

Puede:

- Leer y editar todo.
- Aprobar Beluers.
- Validar fotos.
- Gestionar servicios.
- Revisar reservas.
- Revisar pagos.
- Gestionar reclamos.
- Ver métricas globales.
- Activar o desactivar perfiles.

---

## Flujo de reserva futuro

```txt
1. Clienta elige servicio.
2. Clienta elige add-ons.
3. Clienta elige fecha y hora.
4. Clienta elige modo gestionado o libre.
5. Clienta paga.
6. Se crea booking con estado paid.
7. Si es modo libre, se asigna la Beluer elegida.
8. Si es modo gestionado, n8n publica la reserva en el canal de Beluers.
9. Beluer acepta.
10. Clienta recibe datos de la Beluer.
11. Se envía recordatorio 24h antes.
12. Se completa servicio.
13. Se solicita reseña 30 min después.
14. Se activa recordatorio de retoque día 21.
```

---

## Flujo futuro del panel Beluer

```txt
1. Beluer inicia sesión.
2. Entra a /app/beluer.
3. Ve sus próximas reservas.
4. Acepta o rechaza solicitudes disponibles.
5. Edita su perfil.
6. Sube fotos de portafolio.
7. Selecciona servicios que realiza.
8. Define precios por servicio.
9. Actualiza zonas de atención.
10. Actualiza disponibilidad.
11. Revisa ingresos generados.
12. Revisa reseñas recibidas.
```

---

## Flujo futuro del panel Admin

```txt
1. Admin inicia sesión.
2. Entra a /app/admin.
3. Revisa nuevas postulaciones de Beluers.
4. Aprueba o rechaza perfiles.
5. Valida fotos de portafolio.
6. Edita catálogo general de servicios.
7. Define precios mínimos.
8. Revisa reservas.
9. Revisa pagos.
10. Revisa comisiones.
11. Gestiona reclamos.
12. Revisa métricas.
```

---

## Integraciones futuras

### Supabase

Usado para:

- Auth.
- Base de datos.
- Storage.
- RLS.
- Realtime opcional.

### Culqi / Niubiz

Usado para:

- Pago completo de reserva.
- Confirmación de pago.
- Registro de transacción.
- Comprobante.
- Reembolsos futuros.

### n8n

Usado para:

- Notificación de reserva.
- Canal interno de Beluers.
- Recordatorio 24h.
- Solicitud de reseña.
- Recordatorio día 21.
- Notificaciones de cancelación.
- Notificaciones de reprogramación.
- Registro de automatizaciones.

### WhatsApp Business API

Usado para:

- Confirmar reserva.
- Enviar datos de Beluer.
- Recordatorio de cita.
- Solicitar reseña.
- Recordatorio de retoque.
- Notificar cancelaciones.
- Notificar reprogramaciones.

---

## Relación futura con el código actual

Actualmente el panel usa datos simulados desde:

```txt
components/cliente-panel-original/clientePanelData.ts
```

Y tipos desde:

```txt
components/cliente-panel-original/clientePanelTypes.ts
```

Más adelante, esos datos simulados serán reemplazados por consultas reales a Supabase.

Ejemplo actual:

```txt
clientePanelData.ts → catalogoLashes, catalogoNails, beluersData, historialData, pagosData
```

Ejemplo futuro:

```txt
Supabase → services, beluer_services, beluer_profiles, bookings, payments, favorites
```

La interfaz visual no debería rehacerse. Solo se cambiará la fuente de datos.

---

## Prioridad de implementación futura

### Fase 1: Auth y perfiles

- Crear proyecto Supabase.
- Configurar Auth.
- Crear tablas `profiles`, `client_profiles`, `beluer_profiles`.
- Crear roles.
- Configurar RLS base.

### Fase 2: Catálogo

- Crear tablas `services`, `service_addons`, `beluer_services`.
- Cargar servicios iniciales.
- Permitir que admin active/desactive servicios.
- Permitir que Beluer seleccione servicios y precios.

### Fase 3: Reservas

- Crear `bookings`, `booking_services`, `booking_addons`.
- Crear reservas desde el panel clienta.
- Conectar modo libre.
- Preparar modo gestionado.

### Fase 4: Pagos

- Integrar Culqi o Niubiz.
- Crear registros en `payments`.
- Cambiar estado de reserva después del pago.
- Generar comprobantes.

### Fase 5: Automatizaciones

- Conectar n8n.
- Publicar reserva en canal de Beluers.
- Enviar confirmación a clienta.
- Enviar recordatorio 24h.
- Solicitar reseña.
- Activar recordatorio día 21.

### Fase 6: Panel Beluer

- Crear `/app/beluer`.
- Permitir editar perfil.
- Permitir subir fotos.
- Permitir seleccionar servicios.
- Permitir editar precios.
- Permitir ver reservas e ingresos.

### Fase 7: Panel Admin

- Crear `/app/admin`.
- Aprobar Beluers.
- Gestionar catálogo.
- Revisar reservas.
- Revisar pagos.
- Revisar métricas.

---

## Nota estratégica

belu debe evitar convertirse en un marketplace genérico. La estructura de datos debe reforzar el modelo de agregador gestionado:

- Clienta con menos fricción.
- Beluer con autonomía controlada.
- Admin con capacidad de curaduría.
- Calidad protegida por aprobación y validación.
- Recompra impulsada por automatización del día 21.

El objetivo no es solo registrar datos. El objetivo es construir un sistema que permita operar, escalar y mantener el posicionamiento premium de belu.