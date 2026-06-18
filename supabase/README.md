# Supabase local para belu

Esta carpeta documenta el modelo local de Supabase para el MVP actual de belu.

Los cambios remotos se aplican manualmente desde Supabase. Codex no ejecuta SQL remoto en estos bloques.

## Archivos

```txt
supabase/schema.sql
supabase/rls-policies.sql
supabase/seed.sql
supabase/storage-policies.sql
supabase/triggers.sql
supabase/functions.sql
supabase/views.sql
supabase/audit.sql
```

## Orden sugerido para un entorno nuevo

```txt
1. schema.sql
2. rls-policies.sql
3. seed.sql
4. storage-policies.sql
5. triggers.sql
6. functions.sql
7. views.sql
8. audit.sql
```

`functions.sql`, `views.sql` y `audit.sql` son placeholders/no-op en el MVP actual porque la app usa Server Actions y consultas directas de servidor. Se mantienen para documentar fases posteriores sin dejar SQL legacy ejecutable.

## Modelo actual del MVP

### Usuarios y roles

`profiles` guarda identidad base:

```txt
id
auth_user_id
role: cliente | beluer | admin
full_name
email
phone
created_at
updated_at
```

Reglas de negocio:

- Las clientas pueden registrarse solas.
- Las Beluers no se registran solas; Admin las crea.
- Admin controla roles, estados, niveles, disponibilidad y datos operativos.
- `role`, `auth_user_id` e `id` no deben ser modificables por usuarios no-admin.

### Clientas

`client_profiles` guarda datos complementarios de clienta:

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

En el panel Clienta del MVP solo se editan:

```txt
profiles.phone
client_profiles.beauty_preference
```

### Beluers

`beluer_profiles` guarda perfil operativo:

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
is_available
weekly_income_goal
monthly_income_goal
review_notes
created_at
updated_at
```

`beluer_service_skills` conecta Beluers con servicios:

```txt
id
beluer_profile_id
service_id
status
created_at
updated_at
```

Admin asigna servicios a Beluers. La Beluer no edita sus servicios en el MVP.

### Servicios

`services` usa el modelo de precios actual:

```txt
id
category
name
description
public_price
logistic_fee
base_price
duration_minutes
image_url
is_featured
status
created_at
updated_at
```

La app usa `status = active` para mostrar servicios disponibles.
`image_url` apunta a una imagen publica del bucket `service-images`.
`is_featured` queda reservado para destacar servicios en Admin/Cliente.

Para actualizar un entorno existente manualmente:

```sql
alter table public.services
add column if not exists image_url text;

alter table public.services
add column if not exists is_featured boolean not null default false;
```

### Reservas

`bookings` representa una reserva real de la clienta:

```txt
id
client_profile_id
beluer_profile_id
service_id
booking_mode
scheduled_date
scheduled_time
address
district
notes
is_express
express_fee
status
public_price
logistic_fee
base_price
belu_commission_rate
belu_commission_amount
beluer_payment_amount
payment_status
created_at
updated_at
```

Nota importante: por compatibilidad con la app actual, `bookings.client_profile_id` apunta a `profiles.id` de una clienta. No apunta a `client_profiles.id`.

Estados usados por el MVP:

```txt
pending
assigned
confirmed
in_progress
completed
cancelled
redo_requested
redo_approved
```

Flujo gestionado:

```txt
Clienta crea reserva -> status pending, beluer_profile_id null
Admin asigna Beluer -> status assigned
Beluer acepta -> status confirmed
Beluer no puede tomarla -> status pending, beluer_profile_id null
```

## Una reserva = un servicio

El MVP mantiene un solo `service_id` por reserva.

Servicios multiples quedan para Fase 2 con `booking_items` o equivalente. Esa tabla deberia guardar snapshots por item:

```txt
booking_id
service_id
service_name_snapshot
category_snapshot
public_price_snapshot
base_price_snapshot
belu_commission_amount_snapshot
beluer_payment_amount_snapshot
duration_minutes_snapshot
```

No usar `booking_services` local legacy para el MVP actual.

## Pagos

En el MVP, el flujo de reserva simula pago completo y la app crea reservas con:

```txt
bookings.payment_status = paid
```

Admin > Pagos lee datos basicos desde `bookings`.

La tabla `payments` queda documentada como base posterior para Culqi/Niubiz/Yape/manual:

- webhook idempotente
- conciliacion de `payment_status`
- comprobante o `receipt_url`
- fallos, reembolsos y reversas

No conectar pasarela real sin revisar este flujo.

## WhatsApp / n8n

`automations_log` queda como base para una fase posterior.

Antes de conectar WhatsApp API/n8n faltan:

- eventos exactos
- templates aprobados
- opt-in por usuario
- retry/idempotencia
- manejo de errores
- secretos fuera del frontend

## Portafolio / Supabase Storage

`beluer_photos` queda documentada como tabla de portafolio para una fase posterior con Supabase Storage.

Actualmente:

- Admin Fotos muestra empty state si `beluer_photos` no existe remoto.
- Panel Beluer no implementa subida real de fotos.
- No se deben mostrar fotos fake.

Antes de activar Storage faltan:

- bucket de portafolio
- politicas de Storage
- validacion de tipo/tamano
- flujo de subida
- moderacion Admin

## Seguridad local esperada

`rls-policies.sql` documenta estas reglas:

- `profiles`: authenticated solo puede actualizar `phone`.
- `client_profiles`: authenticated solo puede actualizar `beauty_preference`.
- `bookings`: usuarios autenticados pueden leer sus propias reservas; escrituras directas quedan revocadas.
- `services`: lectura de servicios activos; escritura solo Admin/service_role.
- `beluer_service_skills`: lectura para catalogo/perfil; escritura solo Admin/service_role.
- `beluer_photos`: lectura de aprobadas/propias/admin; escritura directa deshabilitada hasta Storage.

Las escrituras sensibles se hacen desde Server Actions protegidas con validacion de rol/propiedad y `service_role`.

## Archivos SQL legacy retirados de ejecucion activa

El modelo anterior usaba:

```txt
bookings.client_id
bookings.beluer_id
assignment_mode
booking_services
beluer_services
```

La app actual ya no usa esas columnas/tablas. Cualquier referencia a ellas debe considerarse legacy o Fase 2 si esta en comentarios.

## Rutas principales

```txt
/app/cliente
/app/beluer
/app/admin
```

## Variables de entorno

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

`SUPABASE_SERVICE_ROLE_KEY` nunca debe exponerse al frontend.
