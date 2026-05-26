-- =====================================================
-- BELU ✦ SEED DATA
-- Initial catalog data for services and add-ons
-- =====================================================

-- Main services: lashes

insert into services (
  name,
  category,
  description,
  minimum_price,
  estimated_duration_minutes,
  image_url,
  is_active
)
values
  (
    'Clásicas',
    'lashes',
    'Extensiones una a una para un acabado natural.',
    100,
    90,
    null,
    true
  ),
  (
    'Efecto Rímel',
    'lashes',
    'Mayor densidad y oscuridad para una mirada intensa.',
    110,
    105,
    null,
    true
  ),
  (
    'Volumen 3D',
    'lashes',
    'Tres extensiones por pestaña para volumen visible.',
    140,
    120,
    null,
    true
  ),
  (
    'Volumen 4D',
    'lashes',
    'Cuatro extensiones ultrafinas para mayor volumen.',
    160,
    135,
    null,
    true
  ),
  (
    'Mega Volumen 5D',
    'lashes',
    'Efecto de alto impacto con mayor densidad visual.',
    190,
    150,
    null,
    true
  ),
  (
    'Efecto Whispy',
    'lashes',
    'Acabado despuntado y texturizado para una mirada más marcada.',
    170,
    130,
    null,
    true
  ),
  (
    'Efecto Aura',
    'lashes',
    'Volumen suave con longitud gradual en el centro.',
    130,
    105,
    null,
    true
  ),
  (
    'Lifting de pestañas',
    'lashes',
    'Curva y realce de pestañas naturales sin extensiones.',
    100,
    60,
    null,
    true
  ),
  (
    'Planchado de cejas',
    'brows',
    'Diseño y fijación de cejas para un acabado natural.',
    70,
    45,
    null,
    true
  )
on conflict do nothing;

-- Main services: nails

insert into services (
  name,
  category,
  description,
  minimum_price,
  estimated_duration_minutes,
  image_url,
  is_active
)
values
  (
    'Esmaltado Gel',
    'nails',
    'Esmalte semipermanente con brillo de gel.',
    70,
    60,
    null,
    true
  ),
  (
    'Rubber',
    'nails',
    'Base flexible y resistente para uñas naturales.',
    85,
    75,
    null,
    true
  ),
  (
    'Gel de Construcción',
    'nails',
    'Moldeado y refuerzo con gel estructural.',
    100,
    90,
    null,
    true
  ),
  (
    'Acrílicas',
    'nails',
    'Uñas esculpidas con polvo acrílico de alta resistencia.',
    125,
    120,
    null,
    true
  ),
  (
    'Polygel',
    'nails',
    'Técnica híbrida entre acrílico y gel, ligera y resistente.',
    125,
    120,
    null,
    true
  ),
  (
    'Softgel',
    'nails',
    'Extensión con gel suave y flexible para acabado natural.',
    110,
    90,
    null,
    true
  ),
  (
    'Manicura Tradicional',
    'nails',
    'Cuidado clásico de uñas con esmalte tradicional.',
    55,
    50,
    null,
    true
  ),
  (
    'Pedicura Tradicional',
    'nails',
    'Cuidado completo de pies con esmalte tradicional.',
    55,
    60,
    null,
    true
  ),
  (
    'Pedicura Gel',
    'nails',
    'Pedicura semipermanente con acabado de gel.',
    70,
    70,
    null,
    true
  ),
  (
    'Acripie',
    'nails',
    'Uñas acrílicas en pies para mayor duración.',
    125,
    100,
    null,
    true
  )
on conflict do nothing;

-- Add-ons

insert into service_addons (
  name,
  category,
  description,
  price,
  is_active
)
values
  (
    'Depilación con cera',
    'lashes',
    'Depilación complementaria para cejas o zona facial.',
    35,
    true
  ),
  (
    'Depilación con hilo',
    'lashes',
    'Depilación precisa con hilo para acabado limpio.',
    35,
    true
  ),
  (
    'Depilación con navaja',
    'lashes',
    'Perfilado rápido con navaja.',
    25,
    true
  ),
  (
    'Retiro de extensiones',
    'lashes',
    'Retiro seguro de extensiones de pestañas.',
    35,
    true
  ),
  (
    'Diseño de cejas con henna',
    'brows',
    'Diseño y pigmentación temporal con henna.',
    25,
    true
  ),
  (
    'Retiro de gel',
    'nails',
    'Retiro seguro de esmalte gel.',
    25,
    true
  ),
  (
    'Retiro Rubber/Builder Gel',
    'nails',
    'Retiro de base rubber o builder gel.',
    30,
    true
  ),
  (
    'Retiro Acrílico/Polygel',
    'nails',
    'Retiro seguro de acrílico o polygel.',
    35,
    true
  )
on conflict do nothing;

-- Optional demo admin profile
-- This block is intentionally commented because auth_user_id must come from Supabase Auth.
-- Uncomment and replace auth_user_id after creating the first admin user.

-- insert into profiles (
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