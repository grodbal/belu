# Mapa funcional del panel Admin belu ✦

## Objetivo

Este documento describe la estructura funcional del panel Admin de belu.

La finalidad es dejar claro qué hace cada sección del panel, qué datos simulados usa actualmente y con qué tablas futuras de Supabase se conectará.

Ruta actual:

```txt
/app/admin
```

Archivos principales actuales:

```txt
app/app/admin/page.tsx
components/admin-panel-original/AdminPanelOriginalPage.tsx
components/admin-panel-original/adminPanelData.ts
components/admin-panel-original/adminPanelTypes.ts
app/admin-panel-original.css
```

---

## Estado actual del panel

El panel Admin ya funciona como MVP visual con datos simulados.

Incluye:

- Dashboard.
- Beluers.
- Servicios.
- Reservas.
- Fotos.
- Pagos.
- Métricas.

Actualmente no está conectado a Supabase, Culqi/Niubiz, Supabase Storage, n8n ni WhatsApp API.

---

## 1. Dashboard

### Objetivo

Dar al equipo de belu una vista rápida del estado operativo del marketplace.

### Muestra actualmente

- Reservas del día.
- Beluers activas.
- Ingresos del mes.
- Fotos pendientes.
- Prioridades operativas.
- Salud del sistema.

### Datos actuales

Vienen desde:

```txt
adminPanelData.ts
adminAlerts
beluersIniciales
reservasIniciales
pagosIniciales
fotosIniciales
```

### Futuras tablas Supabase

```txt
bookings
beluer_profiles
payments
beluer_photos
automations_log
reviews
```

### Funcionalidad futura

- Mostrar alertas reales.
- Detectar reservas sin asignación.
- Ver fotos pendientes de aprobación.
- Medir velocidad de asignación.
- Monitorear reservas completadas.
- Ver incidencias operativas.

---

## 2. Beluers

### Objetivo

Gestionar especialistas dentro del marketplace.

### Muestra actualmente

- Beluers aprobadas.
- Beluers pendientes.
- Beluers pausadas.
- Beluers rechazadas.
- Nivel de cada Beluer.
- Servicios principales.
- Experiencia.
- Rating.
- Reservas realizadas.
- Detalle de perfil.

### Acciones actuales

```txt
Aprobar Beluer
Rechazar Beluer
Pausar Beluer
Reactivar Beluer
Cambiar nivel
Ver detalle
Filtrar por estado
```

### Datos actuales

Vienen desde:

```txt
adminPanelData.ts
beluersIniciales
```

### Tipos actuales

```txt
AdminBeluer
AdminBeluerEstado
AdminBeluerNivel
```

### Futuras tablas Supabase

```txt
profiles
beluer_profiles
beluer_services
beluer_photos
beluer_availability
reviews
bookings
```

### Funcionalidad futura

- Aprobar postulaciones reales.
- Rechazar perfiles que no cumplan el estándar.
- Pausar Beluers temporalmente.
- Asignar nivel: Nueva, Verificada, Top ✦.
- Revisar portafolio.
- Revisar servicios activos.
- Revisar zonas de atención.
- Ver historial de reservas.
- Ver rating y reseñas.

### Campos sensibles que solo Admin debería controlar

```txt
status
level
rating_average
total_bookings
approval_status
is_featured
```

---

## 3. Servicios

### Objetivo

Gestionar el catálogo maestro de servicios de belu.

### Muestra actualmente

- Servicios de lashes.
- Servicios de nails.
- Servicios de brows.
- Add-ons.
- Precio mínimo.
- Duración estimada.
- Estado activo/inactivo.
- Descripción editable.

### Acciones actuales

```txt
Crear servicio
Editar nombre
Editar categoría
Editar descripción
Editar precio mínimo
Editar duración
Activar/desactivar servicio
Guardar catálogo
Filtrar por categoría
```

### Datos actuales

Vienen desde:

```txt
adminPanelData.ts
serviciosIniciales
```

### Tipos actuales

```txt
AdminServicio
AdminServicioCategoria
```

### Futuras tablas Supabase

```txt
services
service_addons
beluer_services
```

### Funcionalidad futura

- Crear servicios reales.
- Definir precio mínimo.
- Activar o desactivar servicios.
- Definir duración estimada.
- Añadir imagen del servicio.
- Separar servicios principales de add-ons.
- Evitar que Beluers ofrezcan servicios inactivos.
- Proteger el posicionamiento premium mediante precios mínimos.

### Regla estratégica

La Beluer puede definir su precio final, pero no debe poder bajar del precio mínimo definido por belu.

---

## 4. Reservas

### Objetivo

Supervisar el flujo completo de reservas.

### Muestra actualmente

- Todas las reservas.
- Reservas pendientes de asignación.
- Reservas asignadas.
- Reservas confirmadas.
- Reservas completadas.
- Reservas canceladas.
- Modo gestionado o libre.
- Beluer asignada.
- Método de pago.
- Dirección e instrucciones.

### Acciones actuales

```txt
Ver detalle
Asignar Beluer
Confirmar reserva
Marcar completada
Cancelar reserva
Filtrar por estado
```

### Datos actuales

Vienen desde:

```txt
adminPanelData.ts
reservasIniciales
```

### Tipos actuales

```txt
AdminReserva
AdminReservaEstado
```

### Futuras tablas Supabase

```txt
bookings
booking_services
booking_addons
client_profiles
beluer_profiles
payments
automations_log
```

### Funcionalidad futura

- Ver reservas reales.
- Asignar Beluer en modo gestionado.
- Confirmar reserva después de asignación.
- Cambiar estado operativo.
- Detectar reservas pagadas sin asignación.
- Cancelar según política.
- Reprogramar según reglas.
- Disparar notificaciones con n8n.
- Registrar automatizaciones.

### Estados futuros sugeridos

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

---

## 5. Fotos

### Objetivo

Controlar la calidad visual del catálogo.

### Muestra actualmente

- Fotos subidas por Beluers.
- Estado pendiente/aprobada/rechazada.
- Categoría: lashes, nails, brows.
- Beluer propietaria.
- Fecha de subida.
- Nota de revisión.
- Foto destacada.

### Acciones actuales

```txt
Ver detalle
Aprobar foto
Rechazar foto
Marcar destacada
Filtrar por estado
Filtrar por categoría
```

### Datos actuales

Vienen desde:

```txt
adminPanelData.ts
fotosIniciales
```

### Tipos actuales

```txt
AdminFoto
AdminFotoEstado
AdminFotoCategoria
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
bucket: service-images
```

### Funcionalidad futura

- Revisar fotos reales subidas por Beluers.
- Aprobar o rechazar imágenes.
- Marcar imagen destacada.
- Definir portada de perfil.
- Ocultar fotos rechazadas.
- Mostrar solo aprobadas en catálogo público.
- Mantener estándar visual premium.

### Regla recomendada

Toda foto subida por una Beluer debe entrar como:

```txt
pendiente
```

Y solo aparecer públicamente si Admin la aprueba.

---

## 6. Pagos

### Objetivo

Supervisar transacciones, comisiones y pagos a Beluers.

### Muestra actualmente

- Pagos recibidos.
- Método: Yape, Plin, Tarjeta.
- Proveedor: Culqi, Niubiz, Manual.
- Estado: pagado, pendiente, fallido, reembolsado.
- Monto total.
- Comisión belu.
- Neto estimado para Beluer.
- Operación.
- Reserva asociada.

### Acciones actuales

```txt
Ver detalle
Marcar pagado
Marcar pendiente
Reembolsar
Reintentar pago fallido
Filtrar por estado
Filtrar por método
```

### Datos actuales

Vienen desde:

```txt
adminPanelData.ts
pagosIniciales
```

### Tipos actuales

```txt
AdminPago
AdminPagoEstado
AdminPagoMetodo
AdminPagoProveedor
```

### Futuras tablas Supabase

```txt
payments
bookings
beluer_earnings
```

### Funcionalidad futura

- Registrar pagos reales.
- Leer transacciones de Culqi o Niubiz.
- Confirmar pago automáticamente.
- Calcular comisión.
- Calcular neto Beluer.
- Gestionar reembolsos.
- Ver comprobantes.
- Detectar pagos fallidos.
- Alimentar ingresos del panel Beluer.

### Relación con comisión

La comisión debe depender del plan de la Beluer:

```txt
Marketplace: 20%
Libre: 15%
Suscriptor: 10% + mensualidad
```

---

## 7. Métricas

### Objetivo

Dar una vista ejecutiva del rendimiento del negocio.

### Muestra actualmente

- Comisión estimada belu.
- Ingresos procesados.
- Ticket promedio.
- Reservas activas.
- Reservas completadas.
- Tasa de finalización.
- Beluers activas.
- Recompra estimada.
- Evolución semanal.
- Servicios más vendidos.
- Distritos con mayor demanda.
- Alertas estratégicas.

### Datos actuales

Vienen desde:

```txt
adminPanelData.ts
serviciosTopIniciales
distritosTopIniciales
semanasIniciales
beluersIniciales
reservasIniciales
pagosIniciales
```

### Tipos actuales

```txt
AdminMetricaServicio
AdminMetricaDistrito
AdminMetricaSemana
```

### Futuras tablas Supabase

```txt
bookings
payments
beluer_earnings
reviews
automations_log
beluer_profiles
services
```

### Funcionalidad futura

- Medir ventas reales.
- Medir reservas por servicio.
- Medir reservas por distrito.
- Medir ticket promedio.
- Medir recompras por día 21.
- Medir tasa de cancelación.
- Medir tiempo promedio de asignación.
- Medir tasa de reseñas.
- Medir rating promedio por Beluer.
- Detectar servicios con mayor demanda.
- Detectar distritos más rentables.

---

## Relación con Supabase

Actualmente:

```txt
adminPanelData.ts
```

Después:

```txt
Supabase Database
Supabase Storage
Supabase Auth
```

### Mapeo general

```txt
beluersIniciales → profiles + beluer_profiles
serviciosIniciales → services + service_addons
reservasIniciales → bookings + booking_services + booking_addons
fotosIniciales → beluer_photos + Supabase Storage
pagosIniciales → payments + beluer_earnings
serviciosTopIniciales → queries sobre bookings + services
distritosTopIniciales → queries sobre bookings
semanasIniciales → queries sobre bookings + payments
adminAlerts → queries operativas + automations_log
```

---

## Permisos futuros

### Admin puede

- Leer y editar todo.
- Aprobar Beluers.
- Rechazar Beluers.
- Pausar Beluers.
- Cambiar niveles.
- Gestionar catálogo.
- Gestionar reservas.
- Revisar pagos.
- Gestionar reembolsos.
- Validar fotos.
- Ver métricas.
- Revisar automatizaciones.
- Gestionar incidencias.

### Admin no debería hacer sin trazabilidad

- Cambiar montos sin registro.
- Reembolsar sin motivo.
- Eliminar reservas reales.
- Eliminar pagos reales.
- Cambiar comisiones sin auditoría.
- Aprobar fotos sin dejar historial.

---

## Integraciones futuras

### Supabase Auth

Para login seguro de Admin.

### Supabase Database

Para guardar todos los datos operativos.

### Supabase Storage

Para fotos de Beluers, servicios y portafolios.

### Culqi / Niubiz

Para pagos reales, confirmaciones y reembolsos.

### n8n

Para automatizaciones y notificaciones.

### WhatsApp Business API

Para avisos de reserva, asignación, recordatorios, reseñas y recompra.

---

## Prioridad futura de implementación

### Fase 1: Auth y roles

- Crear login.
- Crear rol admin.
- Proteger `/app/admin`.
- Configurar RLS.

### Fase 2: Beluers reales

- Conectar `beluer_profiles`.
- Aprobar, pausar y rechazar Beluers.
- Gestionar niveles.

### Fase 3: Servicios reales

- Conectar `services`.
- Conectar `service_addons`.
- Gestionar catálogo maestro.

### Fase 4: Reservas reales

- Conectar `bookings`.
- Ver reservas reales.
- Asignar Beluers.
- Cambiar estados operativos.

### Fase 5: Fotos reales

- Conectar Supabase Storage.
- Conectar `beluer_photos`.
- Aprobar o rechazar imágenes.

### Fase 6: Pagos reales

- Conectar `payments`.
- Conectar Culqi o Niubiz.
- Calcular comisiones.
- Generar netos Beluer.

### Fase 7: Métricas reales

- Crear queries agregadas.
- Crear dashboards.
- Medir recompra.
- Medir tiempo de asignación.
- Medir rentabilidad por distrito/servicio.

---

## Nota estratégica

El panel Admin es el centro de control de belu.

No debe ser solo un CRUD. Debe ayudar a mantener el estándar premium, proteger la experiencia de la clienta y ordenar la operación de las Beluers.

El Admin debe poder responder rápido a estas preguntas:

- ¿Qué reservas necesitan acción?
- ¿Qué Beluers están listas para activarse?
- ¿Qué fotos no cumplen el estándar?
- ¿Qué servicios generan más demanda?
- ¿Qué distritos son más rentables?
- ¿Dónde se está trabando la operación?
- ¿Cuánto está generando belu realmente?

El objetivo del Admin no es solo administrar datos. Es controlar calidad, velocidad y rentabilidad.