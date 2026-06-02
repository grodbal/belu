# Flujo de autenticación y roles — belu

## Estado actual

belu usa Supabase Auth para gestionar usuarios y sesiones.

Existen tres tipos de usuario:

- Clienta
- Beluer
- Admin

Las rutas protegidas actuales son:

- `/app/cliente`
- `/app/beluer`
- `/app/admin`

La protección de rutas se realiza desde `proxy.ts`.

---

## Registro público

La ruta pública de registro es:

- `/registro`

Esta ruta solo permite crear cuentas de clienta.

Toda cuenta creada desde `/registro` se considera clienta por defecto.

El formulario público NO permite elegir entre clienta, Beluer o admin.

Razón estratégica:

belu necesita controlar la calidad de las Beluers. Una especialista no debe poder crearse una cuenta como Beluer sin pasar primero por revisión, filtro de calidad y aprobación de la administración.

---

## Clientas

Las clientas pueden crear su cuenta libremente desde `/registro`.

Después de iniciar sesión, una clienta debe ingresar a:

- `/app/cliente`

Si una clienta intenta entrar a:

- `/app/beluer`
- `/app/admin`

el sistema debe redirigirla nuevamente a:

- `/app/cliente`

---

## Beluers

Las Beluers NO se crean desde el registro público.

Flujo correcto:

1. La especialista aplica para ser Beluer.
2. La administración revisa su perfil, experiencia, portafolio y calidad.
3. Si aprueba, la administración crea o habilita su cuenta.
4. La cuenta debe tener el rol `beluer`.

Por ahora, el rol se asigna manualmente desde Supabase.

El rol debe estar en `app_metadata`, no en `user_metadata`.

Ejemplo correcto en Supabase:

```json
{
  "role": "beluer"
}