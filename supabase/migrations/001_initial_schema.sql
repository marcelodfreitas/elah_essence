-- ============================================================
-- ELAH
-- Initial Database Schema
-- ============================================================

create extension if not exists "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================

create type public.user_role as enum (
  'admin'
);

create type public.reservation_status as enum (
  'pending',
  'confirmed',
  'cancelled',
  'completed'
);

-- ============================================================
-- PROFILES
-- ============================================================

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,

  full_name text,
  email text,
  phone text,
  avatar_url text,

  role public.user_role not null default 'admin',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- MATERIALS
-- ============================================================

create table public.materials (
  id uuid primary key default gen_random_uuid(),

  name text not null,
  slug text not null unique,
  description text,
  image_url text,

  is_active boolean not null default true,
  sort_order integer not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- CATEGORIES
-- ============================================================

create table public.categories (
  id uuid primary key default gen_random_uuid(),

  name text not null,
  slug text not null unique,
  description text,
  image_url text,

  is_active boolean not null default true,
  sort_order integer not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- PRODUCTS
-- ============================================================

create table public.products (
  id uuid primary key default gen_random_uuid(),

  category_id uuid not null
    references public.categories(id)
    on delete restrict,

  material_id uuid not null
    references public.materials(id)
    on delete restrict,

  name text not null,
  slug text not null unique,
  description text,

  price numeric(10,2) not null
    check (price >= 0),

  promotional_price numeric(10,2)
    check (
      promotional_price is null
      or promotional_price >= 0
    ),

  stock_quantity integer not null default 0
    check (stock_quantity >= 0),

  has_variants boolean not null default false,

  is_featured boolean not null default false,
  is_active boolean not null default true,

  published_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- PRODUCT VARIANTS
-- ============================================================

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),

  product_id uuid not null
    references public.products(id)
    on delete cascade,

  name text,
  size text,
  sku text unique,

  price numeric(10,2)
    check (price is null or price >= 0),

  stock_quantity integer not null default 0
    check (stock_quantity >= 0),

  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- PRODUCT IMAGES
-- ============================================================

create table public.product_images (
  id uuid primary key default gen_random_uuid(),

  product_id uuid not null
    references public.products(id)
    on delete cascade,

  image_url text not null,
  storage_path text,

  alt_text text,
  sort_order integer not null default 0,

  created_at timestamptz not null default now()
);

-- ============================================================
-- PAYMENT METHODS
-- ============================================================

create table public.payment_methods (
  id uuid primary key default gen_random_uuid(),

  name text not null,
  description text,

  is_active boolean not null default true,
  sort_order integer not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- PRODUCT PAYMENT OPTIONS
-- ============================================================

create table public.product_payment_options (
  id uuid primary key default gen_random_uuid(),

  product_id uuid not null
    references public.products(id)
    on delete cascade,

  payment_method_id uuid not null
    references public.payment_methods(id)
    on delete restrict,

  price numeric(10,2) not null
    check (price >= 0),

  installments integer
    check (
      installments is null
      or installments > 0
    ),

  description text,

  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique(product_id, payment_method_id)
);

-- ============================================================
-- RESERVATIONS
-- ============================================================

create table public.reservations (
  id uuid primary key default gen_random_uuid(),

  product_id uuid not null
    references public.products(id)
    on delete restrict,

  variant_id uuid
    references public.product_variants(id)
    on delete restrict,

  customer_name text,
  customer_phone text,

  status public.reservation_status not null default 'pending',

  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- STORE SETTINGS
-- ============================================================

create table public.store_settings (
  id uuid primary key default gen_random_uuid(),

  store_name text not null,
  logo_url text,

  whatsapp_number text,
  instagram_url text,

  pix_description text,

  primary_color text,
  secondary_color text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================

create index idx_products_category
  on public.products(category_id);

create index idx_products_material
  on public.products(material_id);

create index idx_products_active
  on public.products(is_active);

create index idx_products_featured
  on public.products(is_featured);

create index idx_products_created_at
  on public.products(created_at desc);

create index idx_product_variants_product
  on public.product_variants(product_id);

create index idx_product_variants_active
  on public.product_variants(is_active);

create index idx_product_images_product
  on public.product_images(product_id);

create index idx_reservations_product
  on public.reservations(product_id);

create index idx_reservations_variant
  on public.reservations(variant_id);

create index idx_reservations_status
  on public.reservations(status);

-- ============================================================
-- UPDATED_AT FUNCTION
-- ============================================================

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================

create trigger profiles_updated_at
before update on public.profiles
for each row
execute function public.handle_updated_at();

create trigger materials_updated_at
before update on public.materials
for each row
execute function public.handle_updated_at();

create trigger categories_updated_at
before update on public.categories
for each row
execute function public.handle_updated_at();

create trigger products_updated_at
before update on public.products
for each row
execute function public.handle_updated_at();

create trigger product_variants_updated_at
before update on public.product_variants
for each row
execute function public.handle_updated_at();

create trigger payment_methods_updated_at
before update on public.payment_methods
for each row
execute function public.handle_updated_at();

create trigger product_payment_options_updated_at
before update on public.product_payment_options
for each row
execute function public.handle_updated_at();

create trigger reservations_updated_at
before update on public.reservations
for each row
execute function public.handle_updated_at();

create trigger store_settings_updated_at
before update on public.store_settings
for each row
execute function public.handle_updated_at();

-- ============================================================
-- PROFILE CREATION
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    full_name,
    email
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email
  );

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- ============================================================
-- ADMIN CHECK
-- ============================================================

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  );
$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.materials enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.payment_methods enable row level security;
alter table public.product_payment_options enable row level security;
alter table public.reservations enable row level security;
alter table public.store_settings enable row level security;

-- ============================================================
-- PROFILES POLICIES
-- ============================================================

create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
);

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (
  id = auth.uid()
)
with check (
  id = auth.uid()
);

-- ============================================================
-- PUBLIC CATALOG READ ACCESS
-- ============================================================

create policy "materials_public_read"
on public.materials
for select
to anon, authenticated
using (
  is_active = true
);

create policy "categories_public_read"
on public.categories
for select
to anon, authenticated
using (
  is_active = true
);

create policy "products_public_read"
on public.products
for select
to anon, authenticated
using (
  is_active = true
);

create policy "product_variants_public_read"
on public.product_variants
for select
to anon, authenticated
using (
  is_active = true
);

create policy "product_images_public_read"
on public.product_images
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.products
    where products.id = product_images.product_id
      and products.is_active = true
  )
);

create policy "payment_methods_public_read"
on public.payment_methods
for select
to anon, authenticated
using (
  is_active = true
);

create policy "product_payment_options_public_read"
on public.product_payment_options
for select
to anon, authenticated
using (
  is_active = true
);

-- ============================================================
-- ADMIN ACCESS
-- ============================================================

create policy "materials_admin_all"
on public.materials
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "categories_admin_all"
on public.categories
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "products_admin_all"
on public.products
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "product_variants_admin_all"
on public.product_variants
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "product_images_admin_all"
on public.product_images
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "payment_methods_admin_all"
on public.payment_methods
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "product_payment_options_admin_all"
on public.product_payment_options
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "reservations_admin_all"
on public.reservations
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "store_settings_admin_all"
on public.store_settings
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- ============================================================
-- RESERVATION PUBLIC INSERT
-- ============================================================

create policy "reservations_public_insert"
on public.reservations
for insert
to anon, authenticated
with check (
  status = 'pending'
);

-- ============================================================
-- STORE SETTINGS PUBLIC READ
-- ============================================================

create policy "store_settings_public_read"
on public.store_settings
for select
to anon, authenticated
using (true);