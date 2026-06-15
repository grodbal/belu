-- =====================================================
-- BELU - SEED DATA
-- Catalogo base alineado con services del MVP actual.
--
-- La app usa:
-- services.id, name, category, description, public_price,
-- logistic_fee, base_price, duration_minutes, status.
-- =====================================================

insert into public.services (
  name,
  category,
  description,
  public_price,
  logistic_fee,
  base_price,
  duration_minutes,
  status
)
values
  (
    'Extensiones Classic',
    'lashes',
    'Extensiones una a una para un acabado natural.',
    110,
    10,
    100,
    90,
    'active'
  ),
  (
    'Extensiones Volume',
    'lashes',
    'Mayor densidad y volumen visible para una mirada intensa.',
    150,
    10,
    140,
    120,
    'active'
  ),
  (
    'Mega Volumen 5D',
    'lashes',
    'Efecto de alto impacto con mayor densidad visual.',
    200,
    10,
    190,
    150,
    'active'
  ),
  (
    'Lifting de Pestañas',
    'lashes',
    'Curva y realce de pestañas naturales sin extensiones.',
    110,
    10,
    100,
    60,
    'active'
  ),
  (
    'Semipermanente',
    'nails',
    'Esmalte semipermanente con brillo de gel.',
    80,
    10,
    70,
    60,
    'active'
  ),
  (
    'Nail Art Premium',
    'nails',
    'Diseño de uñas con detalle artistico avanzado.',
    120,
    10,
    110,
    90,
    'active'
  ),
  (
    'Acrílico Sculpted',
    'nails',
    'Uñas esculpidas con acrilico de alta resistencia.',
    135,
    10,
    125,
    120,
    'active'
  )
on conflict (name) do update
set
  category = excluded.category,
  description = excluded.description,
  public_price = excluded.public_price,
  logistic_fee = excluded.logistic_fee,
  base_price = excluded.base_price,
  duration_minutes = excluded.duration_minutes,
  status = excluded.status,
  updated_at = now();

-- Optional demo admin profile.
-- Intencionalmente comentado: auth_user_id debe venir de Supabase Auth.

-- insert into public.profiles (
--   auth_user_id,
--   role,
--   full_name,
--   email,
--   phone
-- )
-- values (
--   'REPLACE_WITH_SUPABASE_AUTH_USER_ID',
--   'admin',
--   'Admin belu',
--   'admin@somosbelu.pe',
--   null
-- )
-- on conflict do nothing;
