# Mapa funcional del panel Beluer ✦

## Objetivo

Este documento describe la estructura funcional del panel Beluer de belu.

La finalidad es dejar claro qué hace cada sección del panel, qué datos simulados usa actualmente y con qué tablas futuras de Supabase se conectará.

Ruta actual:

```txt
/app/beluer
```

Archivos principales actuales:

```txt
app/app/beluer/page.tsx
components/beluer-panel-original/BeluerPanelOriginalPage.tsx
components/beluer-panel-original/beluerPanelData.ts
components/beluer-panel-original/beluerPanelTypes.ts
app/beluer-panel-original.css
```

---

## Estado actual del panel

El panel Beluer ya funciona como MVP visual con datos simulados.

Incluye:

- Dashboard.
- Reservas.
- Mis Servicios.
- Portafolio.
- Ingresos.
- Mi Perfil.

Actualmente no está conectado a Supabase, pagos reales, storage ni WhatsApp API.

---

## 1. Dashboard

### Objetivo

Dar a la Beluer una vista rápida de su actividad.

### Muestra actualmente

- Reservas pendientes.
- Reservas aceptadas.
- Ingresos del mes.
- Rating promedio.
- Solicitudes disponibles.
- Meta semanal.

### Datos actuales

Vienen desde:

```txt
beluerPanelData.ts
reservasIniciales
ingresosIniciales
```

### Futuras tablas Supabase

```txt
bookings
booking_services
beluer_earnings
reviews
beluer_profiles
```

### Funcionalidad futura

- Mostrar reservas en tiempo real.
- Mostrar ingresos reales.
- Mostrar rating real.
- Mostrar progreso hacia meta semanal/mensual.
- Alertar nuevas reservas disponibles.

---

## 2. Reservas

### Objetivo

Permitir que la Beluer gestione solicitudes de servicio.

### Muestra actualmente

- Reservas pendientes.
- Reservas aceptadas.
- Reservas rechazadas.
- Detalle de reserva.
- Botones de aceptar o rechazar.

### Acciones actuales

```txt
Aceptar reserva
Rechazar reserva
Ver detalle
```

### Datos actuales

Vienen desde:

```txt
beluerPanelData.ts
reservasIniciales
```

### Tipos actuales

```txt
ReservaBeluer
ReservaEstado
```

### Futuras tablas Supabase

```txt
bookings
booking_services
booking_addons
client_profiles
profiles
payments
```

### Funcionalidad futura

- Ver reservas asignadas a la Beluer.
- Aceptar reservas del canal gestionado.
- Rechazar reservas si no puede atender.
- Ver datos de la clienta.
- Ver dirección, distrito, fecha, hora e instrucciones.
- Cambiar estado de reserva.
- Notificar a clienta por WhatsApp vía n8n.

### Estados futuros posibles

```txt
pending_beluer_assignment
assigned
confirmed
in_progress
completed
cancelled
rescheduled
```

---

## 3. Mis Servicios

### Objetivo

Permitir que la Beluer seleccione qué servicios realiza y defina sus precios.

### Muestra actualmente

- Servicios de lashes.
- Servicios de brows.
- Servicios de nails.
- Switch activo/inactivo.
- Precio editable.
- Precio mínimo de belu.
- Duración estimada.
- Validación de precio mínimo.

### Acciones actuales

```txt
Activar servicio
Desactivar servicio
Cambiar precio
Guardar cambios
```

### Datos actuales

Vienen desde:

```txt
beluerPanelData.ts
serviciosIniciales
```

### Tipos actuales

```txt
ServicioBeluer
```

### Futuras tablas Supabase

```txt
services
beluer_services
beluer_profiles
```

### Funcionalidad futura

- Leer catálogo general de servicios.
- Mostrar solo servicios activos de belu.
- Permitir que la Beluer active/desactive servicios.
- Permitir que la Beluer defina precio por servicio.
- Evitar precios menores al mínimo definido por admin.
- Guardar duración personalizada si aplica.
- Ocultar del catálogo clienta los servicios que la Beluer no realiza.

### Reglas importantes

La Beluer puede definir sus precios, pero no debería poder bajar del precio mínimo establecido por belu.

Esto protege el posicionamiento premium de la plataforma.

---

## 4. Portafolio

### Objetivo

Permitir que la Beluer gestione fotos de sus trabajos.

### Muestra actualmente

- Fotos del portafolio.
- Filtro por categoría.
- Estado aprobada/pendiente.
- Foto de portada.
- Botón para subir foto simulada.
- Botón para marcar portada.
- Botón para eliminar foto.

### Acciones actuales

```txt
Filtrar fotos
Agregar foto simulada
Marcar portada
Eliminar foto
```

### Datos actuales

Vienen desde:

```txt
beluerPanelData.ts
fotosPortafolioIniciales
```

### Tipos actuales

```txt
FotoPortafolio
```

### Futuras tablas Supabase

```txt
beluer_photos
beluer_profiles
```

### Futuro Storage

```txt
Supabase Storage
bucket: beluer-portfolio
bucket: beluer-profile-photos
```

### Funcionalidad futura

- Subir fotos reales.
- Guardar imágenes en Supabase Storage.
- Asociar cada foto a una Beluer.
- Marcar una foto como portada.
- Enviar fotos nuevas a revisión.
- Permitir que admin apruebe o rechace fotos.
- Mostrar solo fotos aprobadas en el catálogo público.

### Regla recomendada

Las fotos nuevas deben quedar en estado:

```txt
pendiente
```

Hasta que admin las apruebe.

---

## 5. Ingresos

### Objetivo

Dar a la Beluer visibilidad sobre cuánto está generando por belu.

### Muestra actualmente

- Neto estimado del mes.
- Bruto generado.
- Comisión belu.
- Neto Beluer.
- Pendiente de pago.
- Servicios completados.
- Historial de ingresos.
- Botón para descargar reporte simulado.

### Datos actuales

Vienen desde:

```txt
beluerPanelData.ts
ingresosIniciales
```

### Tipos actuales

```txt
IngresoBeluer
```

### Futuras tablas Supabase

```txt
beluer_earnings
bookings
payments
booking_services
```

### Funcionalidad futura

- Calcular bruto por servicio.
- Calcular comisión según plan.
- Calcular neto de la Beluer.
- Mostrar pagos pendientes.
- Mostrar pagos realizados.
- Descargar reporte en PDF o Excel.
- Ver fechas de depósito.
- Ver servicios retenidos o cancelados.

### Estados futuros de payout

```txt
pending
scheduled
paid
held
cancelled
```

### Relación con planes

El cálculo de comisión dependerá del plan de la Beluer:

```txt
Marketplace: 20%
Libre: 15%
Suscriptor: 10% + mensualidad
```

---

## 6. Mi Perfil

### Objetivo

Permitir que la Beluer administre su información pública y operativa.

### Muestra actualmente

- Nombre público.
- Bio.
- Instagram.
- WhatsApp.
- Años de experiencia.
- Nivel Beluer.
- Estado del perfil.
- Distritos de atención.
- Disponibilidad general.
- Stats visuales.

### Acciones actuales

```txt
Editar nombre público
Editar bio
Editar Instagram
Editar WhatsApp
Editar experiencia
Cambiar nivel
Cambiar estado
Activar/desactivar distritos
Activar/desactivar disponibilidad general
Guardar cambios
```

### Datos actuales

Vienen desde:

```txt
beluerPanelData.ts
perfilInicial
```

### Tipos actuales

```txt
PerfilBeluer
```

### Futuras tablas Supabase

```txt
profiles
beluer_profiles
beluer_availability
beluer_services
beluer_photos
```

### Funcionalidad futura

- Editar perfil público.
- Editar zonas de atención.
- Cambiar disponibilidad.
- Cambiar foto de perfil.
- Ver estado de aprobación.
- Ver badge asignado por admin.
- Guardar cambios en Supabase.
- Restringir edición de campos sensibles.

### Campos que debería controlar admin

```txt
nivel
estado
rating_average
total_bookings
approval_status
```

### Campos que puede editar la Beluer

```txt
public_name
bio
instagram
phone
districts
availability
profile_photo
services
prices
portfolio_photos
```

---

## Relación con Supabase

### Datos actuales vs datos futuros

Actualmente:

```txt
beluerPanelData.ts
```

Después:

```txt
Supabase Database
Supabase Storage
Supabase Auth
```

### Mapeo general

```txt
reservasIniciales → bookings
serviciosIniciales → services + beluer_services
fotosPortafolioIniciales → beluer_photos + Supabase Storage
ingresosIniciales → beluer_earnings
perfilInicial → beluer_profiles
```

---

## Futuras rutas relacionadas

```txt
/app/beluer
/app/beluer/reservas
/app/beluer/servicios
/app/beluer/portafolio
/app/beluer/ingresos
/app/beluer/perfil
```

Por ahora todo vive dentro de una sola ruta y cambia por estado interno.

Más adelante se puede separar por subrutas si el panel crece.

---

## Permisos futuros

### Beluer puede

- Ver su propio perfil.
- Editar su información pública.
- Subir fotos propias.
- Ver sus reservas.
- Aceptar o rechazar reservas.
- Editar sus servicios y precios.
- Ver sus ingresos.
- Ver sus reseñas.

### Beluer no puede

- Editar otras Beluers.
- Aprobarse a sí misma.
- Cambiar su comisión.
- Cambiar su nivel sin aprobación.
- Ver pagos completos de clientas.
- Ver datos privados de otras clientas.
- Eliminar reservas unilateralmente fuera de política.

---

## Integraciones futuras

### Supabase Auth

Para login de Beluers.

### Supabase Database

Para guardar perfil, servicios, reservas, ingresos y fotos.

### Supabase Storage

Para guardar fotos de perfil y portafolio.

### n8n

Para notificaciones y automatizaciones.

### WhatsApp Business API

Para avisos de reserva, aceptación, recordatorios y cambios.

---

## Prioridad futura de implementación

### Fase 1: Datos reales del perfil

- Conectar `beluer_profiles`.
- Mostrar datos reales de la Beluer autenticada.
- Guardar cambios básicos.

### Fase 2: Servicios reales

- Conectar `services`.
- Conectar `beluer_services`.
- Permitir activar/desactivar servicios.
- Permitir editar precios.

### Fase 3: Portafolio real

- Conectar Supabase Storage.
- Subir fotos.
- Guardar registros en `beluer_photos`.
- Enviar fotos a revisión.

### Fase 4: Reservas reales

- Conectar `bookings`.
- Mostrar reservas asignadas.
- Aceptar/rechazar reservas.
- Activar notificación a clienta.

### Fase 5: Ingresos reales

- Conectar `beluer_earnings`.
- Calcular comisión.
- Mostrar neto.
- Mostrar pagos pendientes y realizados.

---

## Nota estratégica

El panel Beluer no debe ser solo un lugar para ver reservas.

Debe sentirse como una herramienta de crecimiento para la especialista.

La Beluer debe sentir que belu le da:

- Orden.
- Ingresos.
- Visibilidad.
- Control.
- Profesionalización.
- Recompra.
- Tecnología sin complejidad.

El objetivo no es que la Beluer dependa de una agenda manual. El objetivo es que pueda operar como una mini empresa de belleza apoyada por belu.