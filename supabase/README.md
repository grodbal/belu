# Supabase setup para belu ✦

## Objetivo

Esta carpeta contiene la estructura base de Supabase para belu.

Por ahora estos archivos no están conectados al proyecto Next.js. Están versionados para dejar preparada la arquitectura de base de datos, permisos, storage, triggers, funciones RPC, vistas de lectura, auditoría y datos iniciales antes de la integración real.

---

## Archivos actuales

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

---

## Orden correcto de ejecución

Cuando se cree el proyecto real en Supabase, ejecutar los archivos en este orden:

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

No cambiar este orden. Algunos archivos dependen de tablas, enums, funciones auxiliares, buckets, triggers, funciones RPC o vistas creadas previamente.

---

## 1. schema.sql

Crea la estructura principal de base de datos.

Incluye:

- Enums.
- Tablas.
- Relaciones.
- Índices.
- Triggers de `updated_at`.

Tablas principales:

```txt
profiles
client_profiles
beluer_profiles
services
beluer_services
service_addons
beluer_photos
beluer_availability
bookings
booking_services
booking_addons
payments
beluer_earnings
favorites
reviews
automations_log
```

Este archivo debe ejecutarse primero porque los demás dependen de estas tablas y tipos.

---

## 2. rls-policies.sql

Activa Row Level Security y define permisos base.

Incluye:

- Funciones auxiliares.
- Políticas para clientas.
- Políticas para Beluers.
- Políticas para Admin.
- Restricciones iniciales de lectura, creación y actualización.

Funciones principales:

```txt
current_profile_id()
current_user_role()
is_admin()
current_client_profile_id()
current_beluer_profile_id()
```

Este archivo debe ejecutarse después de `schema.sql`, porque necesita que las tablas y enums ya existan.

---

## 3. seed.sql

Carga datos iniciales del catálogo.

Incluye:

- Servicios de lashes.
- Servicios de nails.
- Servicio de brows.
- Add-ons.

Ejemplos:

```txt
Clásicas
Efecto Rímel
Volumen 3D
Lifting de pestañas
Planchado de cejas
Esmaltado Gel
Rubber
Acrílicas
Retiro de gel
Depilación con hilo
```

Este archivo debe ejecutarse después de `schema.sql`, porque inserta datos en tablas ya creadas.

---

## 4. storage-policies.sql

Crea buckets y políticas base para Supabase Storage.

Buckets sugeridos:

```txt
beluer-profile-photos
beluer-portfolio
service-images
review-images
client-uploads
```

Uso principal:

- Fotos de perfil de Beluers.
- Fotos de portafolio.
- Imágenes de servicios.
- Imágenes asociadas a reviews.
- Archivos o imágenes subidas por clientas.

Este archivo debe ejecutarse después de `rls-policies.sql`, porque usa funciones auxiliares como:

```txt
is_admin()
current_beluer_profile_id()
current_client_profile_id()
```

---

## 5. triggers.sql

Crea lógica automática de negocio a nivel base de datos.

Incluye:

- Validar que el precio de una Beluer no esté por debajo del precio mínimo de belu.
- Sincronizar estado de pago con reserva.
- Crear ingresos de Beluer después de pago aprobado.
- Actualizar total de reservas de Beluer.
- Recalcular rating promedio.
- Mantener una sola foto de portada por Beluer.
- Forzar fotos nuevas a revisión.
- Registrar eventos de automatización.
- Validar que solo se pueda reseñar una reserva completada.

Este archivo debe ejecutarse después de `schema.sql`, `rls-policies.sql`, `seed.sql` y `storage-policies.sql`.

---

## 6. functions.sql

Crea funciones RPC seguras para operaciones sensibles.

Incluye funciones para:

- Crear reserva de clienta.
- Aceptar reserva como Beluer.
- Asignar Beluer desde Admin.
- Cambiar estado de reserva.
- Cancelar reserva.
- Reprogramar reserva.
- Aprobar, rechazar o pausar Beluer.
- Cambiar nivel de Beluer.
- Aprobar o rechazar fotos.
- Marcar foto destacada.
- Registrar pago manual.
- Reembolsar pago.
- Consultar resumen de dashboard Admin.
- Consultar resumen de dashboard Beluer.
- Consultar resumen de dashboard Clienta.

El frontend debería usar estas funciones para operaciones sensibles en lugar de actualizar directamente tablas críticas.

---

## 7. views.sql

Crea vistas de lectura para simplificar consultas del frontend.

Incluye vistas para:

- Catálogo público de Beluers.
- Servicios públicos por Beluer.
- Portafolio público aprobado.
- Catálogo activo de servicios.
- Catálogo activo de add-ons.
- Reservas para Admin.
- Reservas para Clienta.
- Reservas para Beluer.
- Ingresos de Beluer.
- Pagos para Admin.
- Moderación de Beluers.
- Moderación de fotos.
- Métricas por servicio.
- Métricas por distrito.
- Métricas por día.
- Eventos de automatización.

Vistas principales:

```txt
v_public_beluer_catalog
v_public_beluer_services
v_public_beluer_portfolio
v_active_services_catalog
v_active_addons_catalog
v_admin_bookings_overview
v_client_bookings_overview
v_beluer_bookings_overview
v_beluer_earnings_overview
v_admin_payments_overview
v_admin_beluer_moderation
v_admin_photo_moderation
v_admin_metrics_by_service
v_admin_metrics_by_district
v_admin_metrics_by_day
v_admin_automation_events
```

Este archivo debe ejecutarse después de `functions.sql`.

---

## 8. audit.sql

Crea trazabilidad para cambios sensibles.

Incluye:

- Enum de acciones de auditoría.
- Tabla `audit_log`.
- Políticas RLS para que solo Admin pueda leer auditoría.
- Funciones auxiliares para registrar cambios.
- Triggers de auditoría para tablas sensibles.
- Vista `v_admin_audit_log`.

Registra cambios en:

```txt
beluer_profiles
services
bookings
payments
beluer_photos
```

Tipos de acciones auditadas:

```txt
insert
update
delete
status_change
level_change
payment_change
refund
photo_moderation
booking_assignment
booking_status_change
```

Este archivo debe ejecutarse al final porque depende de tablas, enums, funciones auxiliares y vistas ya creadas.

---

## Estado actual del frontend

Actualmente los paneles funcionan con datos simulados en archivos locales:

```txt
components/cliente-panel-original/clientePanelData.ts
components/beluer-panel-original/beluerPanelData.ts
components/admin-panel-original/adminPanelData.ts
```

Más adelante, estos datos simulados serán reemplazados por consultas reales a Supabase.

---

## Rutas del sistema

```txt
/app/cliente
/app/beluer
/app/admin
```

---

## Mapeos técnicos existentes

Clienta:

```txt
components/cliente-panel-original/supabaseMapping.ts
```

Beluer:

```txt
components/beluer-panel-original/supabaseMapping.ts
```

Admin:

```txt
components/admin-panel-original/supabaseMapping.ts
```

Estos archivos no conectan Supabase todavía. Solo documentan cómo los datos actuales se relacionarán con las tablas reales.

---

## Flujo futuro de integración

### Fase 1: Crear proyecto Supabase

- Crear proyecto en Supabase.
- Configurar región.
- Guardar URL del proyecto.
- Guardar anon key.
- Guardar service role key en entorno seguro.

### Fase 2: Ejecutar SQL

Ejecutar en el SQL Editor de Supabase:

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

### Fase 3: Crear primer usuario Admin

- Crear usuario desde Supabase Auth.
- Copiar el `auth_user_id`.
- Insertar registro en `profiles` con rol `admin`.

Ejemplo:

```sql
insert into profiles (
  auth_user_id,
  role,
  full_name,
  email,
  phone
)
values (
  'REPLACE_WITH_SUPABASE_AUTH_USER_ID',
  'admin',
  'Admin belu',
  'admin@somosbelu.pe',
  null
);
```

### Fase 4: Configurar variables de entorno en Next.js

Crear archivo local:

```txt
.env.local
```

Variables futuras:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

La `SUPABASE_SERVICE_ROLE_KEY` nunca debe exponerse en el frontend.

### Fase 5: Instalar Supabase en Next.js

```powershell
npm install @supabase/supabase-js
```

### Fase 6: Crear cliente Supabase

Archivos futuros sugeridos:

```txt
lib/supabase/client.ts
lib/supabase/server.ts
```

### Fase 7: Conectar Auth

- Login de clienta.
- Login de Beluer.
- Login de Admin.
- Protección de rutas según rol.

### Fase 8: Reemplazar datos mock

Reemplazar gradualmente:

```txt
clientePanelData.ts → consultas reales para clienta
beluerPanelData.ts → consultas reales para Beluer
adminPanelData.ts → consultas reales para Admin
```

---

## Precauciones importantes

No ejecutar `rls-policies.sql` antes de `schema.sql`.

No ejecutar `storage-policies.sql` antes de `rls-policies.sql`.

No ejecutar `triggers.sql` antes de tener tablas, funciones auxiliares y seed base.

No ejecutar `functions.sql` antes de `triggers.sql`.

No ejecutar `views.sql` antes de `functions.sql`.

No ejecutar `audit.sql` antes de `views.sql`.

No compartir la `service role key`.

No conectar pagos reales hasta validar bien reservas, usuarios y permisos.

No permitir que Beluers editen campos sensibles como:

```txt
level
status
rating_average
total_bookings
review_notes
```

No permitir que clientas cambien estados internos de reservas fuera de política.

No permitir que una Beluer vea pagos completos de clientas. Su vista financiera debe salir de `beluer_earnings`.

---

## Próximos pasos recomendados

```txt
1. Crear proyecto Supabase real.
2. Ejecutar archivos SQL en orden.
3. Instalar @supabase/supabase-js.
4. Crear clientes Supabase en Next.js.
5. Configurar variables .env.local.
6. Crear Auth y roles.
7. Conectar primero el Admin panel.
```

---

## Nota estratégica

La base de datos de belu no solo debe almacenar información.

Debe proteger tres cosas:

1. La experiencia premium de la clienta.
2. La autonomía controlada de la Beluer.
3. La capacidad operativa del Admin.

El objetivo es que la plataforma pueda crecer sin depender de operaciones manuales frágiles.