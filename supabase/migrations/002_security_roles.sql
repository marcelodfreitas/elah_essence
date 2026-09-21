-- ============================================================
-- ELAH
-- Security Roles
-- ============================================================

ALTER TYPE public.user_role
ADD VALUE IF NOT EXISTS 'customer';