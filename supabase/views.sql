-- =====================================================
-- BELU ✦ SUPABASE VIEWS
-- Read-only views for dashboards, catalog and operational panels
-- =====================================================

-- IMPORTANT:
-- Execute after:
-- 1. schema.sql
-- 2. rls-policies.sql
-- 3. seed.sql
-- 4. storage-policies.sql
-- 5. triggers.sql
-- 6. functions.sql
--
-- Views help simplify frontend queries.
-- They do not replace RLS, RPC functions or business rules.

-- =====================================================
-- 1. PUBLIC BELUER CATALOG
-- Approved Beluers visible to clientas
-- =====================================================

create or replace view public.v_public_beluer_catalog as
select
  bp.id as beluer_id,
  bp.public_name,
  bp.bio,
  bp.instagram,
  bp.profile_photo_url,
  bp.districts,
  bp.experience_years,
  bp.level,
  bp.rating_average,
  bp.total_bookings,
  bp.is_available,
  (
    select bpht.image_url
    from beluer_photos bpht
    where bpht.beluer_id = bp.id
      and bpht.status = 'approved'
      and bpht.is_cover = true
    order by bpht.created_at desc
    limit 1
  ) as cover_photo_url,
  (
    select count(*)
    from beluer_photos bpht
    where bpht.beluer_id = bp.id
      and bpht.status = 'approved'
  ) as approved_photos_count
from beluer_profiles bp
where bp.status = 'approved';

-- =====================================================
-- 2. PUBLIC BELUER SERVICES
-- Services shown in each Beluer profile
-- =====================================================

create or replace view public.v_public_beluer_services as
select
  bs.id as beluer_service_id,
  bs.beluer_id,
  s.id as service_id,
  s.name as service_name,
  s.category,
  s.description,
  s.minimum_price,
  bs.price,
  coalesce(bs.duration_minutes, s.estimated_duration_minutes) as duration_minutes,
  bs.is_active
from beluer_services bs
join services s on s.id = bs.service_id
join beluer_profiles bp on bp.id = bs.beluer_id
where bs.is_active = true
  and s.is_active = true
  and bp.status = 'approved';

-- =====================================================
-- 3. PUBLIC BELUER PORTFOLIO
-- Approved photos for catalog display
-- =====================================================

create or replace view public.v_public_beluer_portfolio as
select
  bpht.id as photo_id,
  bpht.beluer_id,
  bp.public_name,
  bpht.image_url,
  bpht.category,
  bpht.caption,
  bpht.is_cover,
  bpht.is_featured,
  bpht.created_at
from beluer_photos bpht
join beluer_profiles bp on bp.id = bpht.beluer_id
where bp.status = 'approved'
  and bpht.status = 'approved';

-- =====================================================
-- 4. ACTIVE SERVICES CATALOG
-- General services visible to clientas and Beluers
-- =====================================================

create or replace view public.v_active_services_catalog as
select
  id,
  name,
  category,
  description,
  minimum_price,
  estimated_duration_minutes,
  image_url,
  is_active,
  created_at
from services
where is_active = true;

-- =====================================================
-- 5. ACTIVE ADDONS CATALOG
-- Add-ons visible to clientas
-- =====================================================

create or replace view public.v_active_addons_catalog as
select
  id,
  name,
  category,
  description,
  price,
  is_active,
  created_at
from service_addons
where is_active = true;

-- =====================================================
-- 6. ADMIN BOOKINGS OVERVIEW
-- Operational booking view for Admin panel
-- =====================================================

create or replace view public.v_admin_bookings_overview as
select
  b.id as booking_id,
  b.status,
  b.assignment_mode,
  b.scheduled_date,
  b.scheduled_time,
  b.district,
  b.address,
  b.instructions,
  b.subtotal,
  b.logistics_fee,
  b.express_fee,
  b.total,
  b.payment_status,
  b.created_at,
  cp.id as client_profile_id,
  p_client.full_name as client_name,
  p_client.email as client_email,
  p_client.phone as client_phone,
  bp.id as beluer_profile_id,
  bp.public_name as beluer_name,
  bp.level as beluer_level,
  bp.status as beluer_status,
  (
    select string_agg(bs.name_snapshot, ', ')
    from booking_services bs
    where bs.booking_id = b.id
  ) as service_names,
  (
    select string_agg(ba.name_snapshot, ', ')
    from booking_addons ba
    where ba.booking_id = b.id
  ) as addon_names
from bookings b
join client_profiles cp on cp.id = b.client_id
join profiles p_client on p_client.id = cp.profile_id
left join beluer_profiles bp on bp.id = b.beluer_id;

-- =====================================================
-- 7. CLIENT BOOKINGS OVERVIEW
-- Booking history for Clienta panel
-- =====================================================

create or replace view public.v_client_bookings_overview as
select
  b.id as booking_id,
  b.client_id,
  b.beluer_id,
  bp.public_name as beluer_name,
  bp.profile_photo_url as beluer_photo_url,
  b.status,
  b.assignment_mode,
  b.scheduled_date,
  b.scheduled_time,
  b.district,
  b.address,
  b.instructions,
  b.total,
  b.payment_status,
  b.created_at,
  (
    select string_agg(bs.name_snapshot, ', ')
    from booking_services bs
    where bs.booking_id = b.id
  ) as service_names,
  (
    select string_agg(ba.name_snapshot, ', ')
    from booking_addons ba
    where ba.booking_id = b.id
  ) as addon_names,
  (
    select r.rating
    from reviews r
    where r.booking_id = b.id
    limit 1
  ) as review_rating
from bookings b
left join beluer_profiles bp on bp.id = b.beluer_id;

-- =====================================================
-- 8. BELUER BOOKINGS OVERVIEW
-- Assigned bookings for Beluer panel
-- =====================================================

create or replace view public.v_beluer_bookings_overview as
select
  b.id as booking_id,
  b.beluer_id,
  b.client_id,
  p_client.full_name as client_name,
  p_client.phone as client_phone,
  b.status,
  b.assignment_mode,
  b.scheduled_date,
  b.scheduled_time,
  b.district,
  b.address,
  b.instructions,
  b.total,
  b.payment_status,
  b.created_at,
  (
    select string_agg(bs.name_snapshot, ', ')
    from booking_services bs
    where bs.booking_id = b.id
  ) as service_names,
  (
    select string_agg(ba.name_snapshot, ', ')
    from booking_addons ba
    where ba.booking_id = b.id
  ) as addon_names
from bookings b
join client_profiles cp on cp.id = b.client_id
join profiles p_client on p_client.id = cp.profile_id
where b.beluer_id is not null;

-- =====================================================
-- 9. BELUER EARNINGS OVERVIEW
-- Financial summary for Beluer panel
-- =====================================================

create or replace view public.v_beluer_earnings_overview as
select
  be.id as earning_id,
  be.booking_id,
  be.beluer_id,
  bp.public_name as beluer_name,
  be.gross_amount,
  be.platform_commission_percentage,
  be.platform_commission_amount,
  be.net_amount,
  be.payout_status,
  be.created_at,
  b.scheduled_date,
  b.scheduled_time,
  b.status as booking_status,
  (
    select string_agg(bs.name_snapshot, ', ')
    from booking_services bs
    where bs.booking_id = b.id
  ) as service_names
from beluer_earnings be
join beluer_profiles bp on bp.id = be.beluer_id
join bookings b on b.id = be.booking_id;

-- =====================================================
-- 10. ADMIN PAYMENTS OVERVIEW
-- Payment supervision for Admin panel
-- =====================================================

create or replace view public.v_admin_payments_overview as
select
  pay.id as payment_id,
  pay.booking_id,
  pay.client_id,
  p_client.full_name as client_name,
  bp.id as beluer_id,
  bp.public_name as beluer_name,
  pay.provider,
  pay.method,
  pay.status,
  pay.amount,
  pay.currency,
  pay.transaction_id,
  pay.receipt_url,
  pay.paid_at,
  pay.created_at,
  be.platform_commission_amount,
  be.net_amount as beluer_net_amount,
  b.status as booking_status,
  (
    select string_agg(bs.name_snapshot, ', ')
    from booking_services bs
    where bs.booking_id = b.id
  ) as service_names
from payments pay
join bookings b on b.id = pay.booking_id
join client_profiles cp on cp.id = pay.client_id
join profiles p_client on p_client.id = cp.profile_id
left join beluer_profiles bp on bp.id = b.beluer_id
left join beluer_earnings be on be.booking_id = b.id;

-- =====================================================
-- 11. ADMIN BELUER MODERATION OVERVIEW
-- Review pending/approved/paused Beluers
-- =====================================================

create or replace view public.v_admin_beluer_moderation as
select
  bp.id as beluer_id,
  bp.profile_id,
  p.full_name,
  p.email,
  p.phone as profile_phone,
  bp.public_name,
  bp.instagram,
  bp.phone as beluer_phone,
  bp.districts,
  bp.experience_years,
  bp.level,
  bp.status,
  bp.rating_average,
  bp.total_bookings,
  bp.profile_photo_url,
  bp.review_notes,
  bp.created_at,
  (
    select count(*)
    from beluer_photos bpht
    where bpht.beluer_id = bp.id
  ) as total_photos,
  (
    select count(*)
    from beluer_photos bpht
    where bpht.beluer_id = bp.id
      and bpht.status = 'pending_review'
  ) as pending_photos
from beluer_profiles bp
join profiles p on p.id = bp.profile_id;

-- =====================================================
-- 12. ADMIN PHOTO MODERATION OVERVIEW
-- Photos pending approval/rejection
-- =====================================================

create or replace view public.v_admin_photo_moderation as
select
  bpht.id as photo_id,
  bpht.beluer_id,
  bp.public_name as beluer_name,
  bpht.image_url,
  bpht.category,
  bpht.caption,
  bpht.is_cover,
  bpht.is_featured,
  bpht.status,
  bpht.review_notes,
  bpht.created_at,
  bpht.updated_at
from beluer_photos bpht
join beluer_profiles bp on bp.id = bpht.beluer_id;

-- =====================================================
-- 13. ADMIN METRICS BY SERVICE
-- Aggregated service demand
-- =====================================================

create or replace view public.v_admin_metrics_by_service as
select
  bs.name_snapshot as service_name,
  count(*) as total_bookings,
  coalesce(sum(bs.price_snapshot), 0) as service_revenue
from booking_services bs
join bookings b on b.id = bs.booking_id
where b.status <> 'cancelled'
group by bs.name_snapshot
order by total_bookings desc;

-- =====================================================
-- 14. ADMIN METRICS BY DISTRICT
-- Aggregated district demand
-- =====================================================

create or replace view public.v_admin_metrics_by_district as
select
  b.district,
  count(*) as total_bookings,
  coalesce(sum(b.total), 0) as total_revenue
from bookings b
where b.status <> 'cancelled'
group by b.district
order by total_bookings desc;

-- =====================================================
-- 15. ADMIN METRICS BY DAY
-- Daily booking and revenue trend
-- =====================================================

create or replace view public.v_admin_metrics_by_day as
select
  b.scheduled_date,
  count(*) as total_bookings,
  coalesce(sum(b.total), 0) as total_revenue,
  count(*) filter (where b.status = 'completed') as completed_bookings,
  count(*) filter (where b.status = 'cancelled') as cancelled_bookings
from bookings b
group by b.scheduled_date
order by b.scheduled_date asc;

-- =====================================================
-- 16. AUTOMATION EVENTS OVERVIEW
-- For Admin/n8n debugging
-- =====================================================

create or replace view public.v_admin_automation_events as
select
  al.id,
  al.booking_id,
  al.automation_type,
  al.status,
  al.sent_at,
  al.error_message,
  al.created_at,
  b.status as booking_status,
  b.scheduled_date,
  b.scheduled_time,
  b.district
from automations_log al
left join bookings b on b.id = al.booking_id
order by al.created_at desc;

-- =====================================================
-- NOTES
-- =====================================================

-- Views are read-only helpers for frontend queries.
-- RLS on underlying tables still matters.
-- For sensitive admin views, frontend routes must also verify admin role.
-- If needed later, use security_invoker views depending on Supabase/Postgres support.