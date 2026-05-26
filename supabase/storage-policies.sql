-- =====================================================
-- BELU ✦ SUPABASE STORAGE POLICIES
-- Buckets and base policies for images and uploads
-- =====================================================

-- IMPORTANT:
-- This file assumes Supabase Storage is enabled.
-- It also assumes the helper functions from rls-policies.sql already exist:
-- public.is_admin()
-- public.current_beluer_profile_id()
-- public.current_client_profile_id()

-- =====================================================
-- STORAGE BUCKETS
-- =====================================================

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values
  (
    'beluer-profile-photos',
    'beluer-profile-photos',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'beluer-portfolio',
    'beluer-portfolio',
    true,
    10485760,
    array['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'service-images',
    'service-images',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'review-images',
    'review-images',
    false,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'client-uploads',
    'client-uploads',
    false,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  )
on conflict (id) do nothing;

-- =====================================================
-- STORAGE RLS
-- =====================================================

-- Supabase Storage uses storage.objects.
-- Bucket access is controlled with policies on storage.objects.

-- =====================================================
-- PUBLIC READ FOR PUBLIC BUCKETS
-- =====================================================

drop policy if exists "public_read_beluer_profile_photos" on storage.objects;
create policy "public_read_beluer_profile_photos"
on storage.objects
for select
using (
  bucket_id = 'beluer-profile-photos'
);

drop policy if exists "public_read_beluer_portfolio" on storage.objects;
create policy "public_read_beluer_portfolio"
on storage.objects
for select
using (
  bucket_id = 'beluer-portfolio'
);

drop policy if exists "public_read_service_images" on storage.objects;
create policy "public_read_service_images"
on storage.objects
for select
using (
  bucket_id = 'service-images'
);

-- =====================================================
-- ADMIN FULL ACCESS
-- =====================================================

drop policy if exists "admin_full_access_storage" on storage.objects;
create policy "admin_full_access_storage"
on storage.objects
for all
using (
  public.is_admin()
)
with check (
  public.is_admin()
);

-- =====================================================
-- BELUER PROFILE PHOTOS
-- =====================================================

-- Recommended object path:
-- beluer-profile-photos/{beluer_id}/profile.jpg
--
-- Example:
-- beluer-profile-photos/uuid-profile-id/profile.webp

drop policy if exists "beluer_upload_own_profile_photo" on storage.objects;
create policy "beluer_upload_own_profile_photo"
on storage.objects
for insert
with check (
  bucket_id = 'beluer-profile-photos'
  and auth.role() = 'authenticated'
  and (storage.foldername(name))[1] = public.current_beluer_profile_id()::text
);

drop policy if exists "beluer_update_own_profile_photo" on storage.objects;
create policy "beluer_update_own_profile_photo"
on storage.objects
for update
using (
  bucket_id = 'beluer-profile-photos'
  and auth.role() = 'authenticated'
  and (storage.foldername(name))[1] = public.current_beluer_profile_id()::text
)
with check (
  bucket_id = 'beluer-profile-photos'
  and auth.role() = 'authenticated'
  and (storage.foldername(name))[1] = public.current_beluer_profile_id()::text
);

drop policy if exists "beluer_delete_own_profile_photo" on storage.objects;
create policy "beluer_delete_own_profile_photo"
on storage.objects
for delete
using (
  bucket_id = 'beluer-profile-photos'
  and auth.role() = 'authenticated'
  and (storage.foldername(name))[1] = public.current_beluer_profile_id()::text
);

-- =====================================================
-- BELUER PORTFOLIO
-- =====================================================

-- Recommended object path:
-- beluer-portfolio/{beluer_id}/{filename}
--
-- Example:
-- beluer-portfolio/uuid-beluer-id/lashes-001.webp

drop policy if exists "beluer_upload_own_portfolio_photo" on storage.objects;
create policy "beluer_upload_own_portfolio_photo"
on storage.objects
for insert
with check (
  bucket_id = 'beluer-portfolio'
  and auth.role() = 'authenticated'
  and (storage.foldername(name))[1] = public.current_beluer_profile_id()::text
);

drop policy if exists "beluer_update_own_portfolio_photo" on storage.objects;
create policy "beluer_update_own_portfolio_photo"
on storage.objects
for update
using (
  bucket_id = 'beluer-portfolio'
  and auth.role() = 'authenticated'
  and (storage.foldername(name))[1] = public.current_beluer_profile_id()::text
)
with check (
  bucket_id = 'beluer-portfolio'
  and auth.role() = 'authenticated'
  and (storage.foldername(name))[1] = public.current_beluer_profile_id()::text
);

drop policy if exists "beluer_delete_own_portfolio_photo" on storage.objects;
create policy "beluer_delete_own_portfolio_photo"
on storage.objects
for delete
using (
  bucket_id = 'beluer-portfolio'
  and auth.role() = 'authenticated'
  and (storage.foldername(name))[1] = public.current_beluer_profile_id()::text
);

-- =====================================================
-- SERVICE IMAGES
-- =====================================================

-- Only Admin should upload/update/delete service images.
-- Public can read due to public_read_service_images policy above.

drop policy if exists "admin_manage_service_images" on storage.objects;
create policy "admin_manage_service_images"
on storage.objects
for all
using (
  bucket_id = 'service-images'
  and public.is_admin()
)
with check (
  bucket_id = 'service-images'
  and public.is_admin()
);

-- =====================================================
-- REVIEW IMAGES
-- =====================================================

-- Recommended object path:
-- review-images/{client_id}/{booking_id}/{filename}
--
-- Bucket is private.
-- Clienta can upload her own review image.
-- Admin can read/manage all via admin_full_access_storage.

drop policy if exists "client_upload_own_review_image" on storage.objects;
create policy "client_upload_own_review_image"
on storage.objects
for insert
with check (
  bucket_id = 'review-images'
  and auth.role() = 'authenticated'
  and (storage.foldername(name))[1] = public.current_client_profile_id()::text
);

drop policy if exists "client_read_own_review_image" on storage.objects;
create policy "client_read_own_review_image"
on storage.objects
for select
using (
  bucket_id = 'review-images'
  and auth.role() = 'authenticated'
  and (storage.foldername(name))[1] = public.current_client_profile_id()::text
);

drop policy if exists "client_delete_own_review_image" on storage.objects;
create policy "client_delete_own_review_image"
on storage.objects
for delete
using (
  bucket_id = 'review-images'
  and auth.role() = 'authenticated'
  and (storage.foldername(name))[1] = public.current_client_profile_id()::text
);

-- =====================================================
-- CLIENT UPLOADS
-- =====================================================

-- Recommended object path:
-- client-uploads/{client_id}/{filename}
--
-- Bucket is private.
-- Useful later for comprobantes, referencias, reclamos, etc.

drop policy if exists "client_upload_own_file" on storage.objects;
create policy "client_upload_own_file"
on storage.objects
for insert
with check (
  bucket_id = 'client-uploads'
  and auth.role() = 'authenticated'
  and (storage.foldername(name))[1] = public.current_client_profile_id()::text
);

drop policy if exists "client_read_own_file" on storage.objects;
create policy "client_read_own_file"
on storage.objects
for select
using (
  bucket_id = 'client-uploads'
  and auth.role() = 'authenticated'
  and (storage.foldername(name))[1] = public.current_client_profile_id()::text
);

drop policy if exists "client_delete_own_file" on storage.objects;
create policy "client_delete_own_file"
on storage.objects
for delete
using (
  bucket_id = 'client-uploads'
  and auth.role() = 'authenticated'
  and (storage.foldername(name))[1] = public.current_client_profile_id()::text
);

-- =====================================================
-- NOTES
-- =====================================================

-- 1. Public buckets:
-- beluer-profile-photos
-- beluer-portfolio
-- service-images
--
-- 2. Private buckets:
-- review-images
-- client-uploads
--
-- 3. Beluer portfolio images should still be moderated in beluer_photos.
-- Storage can be public, but public catalog should only display rows where:
-- beluer_photos.status = 'approved'
--
-- 4. Admin can manage all storage objects through admin_full_access_storage.
--
-- 5. For stricter production security, image uploads should be done through
-- signed uploads or server actions that validate file names and ownership.