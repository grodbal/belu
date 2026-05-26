# Supabase setup para belu ✦

## Objetivo

Esta carpeta contiene la estructura base de Supabase para belu.

Por ahora estos archivos no están conectados al proyecto Next.js. Están versionados para dejar preparada la arquitectura de base de datos, permisos y datos iniciales antes de la integración real.

---

## Archivos actuales

```txt
supabase/schema.sql
supabase/rls-policies.sql
supabase/seed.sql
```

---

## Orden correcto de ejecución

Cuando se cree el proyecto real en Supabase, ejecutar los archivos en este orden:

```txt
1. schema.sql
2. rls-policies.sql
3. seed.sql
```

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

## Estado actual

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

No ejecutar `seed.sql` antes de tener las tablas creadas.

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

## Próximos archivos recomendados

```txt
supabase/storage-policies.sql
supabase/functions.sql
supabase/triggers.sql
```

Posibles responsabilidades:

`storage-policies.sql`

- Buckets.
- Políticas de subida de fotos.
- Restricciones para portafolio de Beluers.

`functions.sql`

- Funciones RPC seguras para reservar.
- Funciones RPC para aceptar reservas.
- Funciones RPC para calcular comisiones.

`triggers.sql`

- Validar precio mínimo.
- Crear earnings después de pago.
- Actualizar rating promedio.
- Actualizar total de reservas.
- Registrar automatizaciones.

---

## Nota estratégica

La base de datos de belu no solo debe almacenar información.

Debe proteger tres cosas:

1. La experiencia premium de la clienta.
2. La autonomía controlada de la Beluer.
3. La capacidad operativa del Admin.

El objetivo es que la plataforma pueda crecer sin depender de operaciones manuales frágiles.