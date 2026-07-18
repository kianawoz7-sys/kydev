-- ============================================================
-- MABATAG / KYDEV — SUPABASE SETUP SEDERHANA
-- Jalankan sekali pada project Supabase baru.
--
-- Yang dibuat:
-- - services
-- - orders
-- - settings
-- - faculties
-- - study_programs
-- - relasi, trigger, index, RLS, dan policy
--
-- Yang TIDAK dibuat:
-- - data dummy jasa
-- - data dummy pesanan
-- - seed fakultas/prodi
-- - akun admin
-- - file Storage
--
-- Sebelum menjalankan:
-- Buat manual bucket:
-- 1. public-assets  -> Public ON
-- 2. order-files   -> Public OFF
-- ============================================================


-- ============================================================
-- 1. EXTENSION DAN HELPER
-- ============================================================

create extension if not exists pgcrypto;


create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;


create or replace function public.generate_order_code()
returns text
language sql
volatile
set search_path = public
as $$
  select
    'NT-'
    || to_char(timezone('Asia/Jakarta', now()), 'YYMMDD')
    || '-'
    || upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 8));
$$;


-- ============================================================
-- 2. TABLE SERVICES
-- ============================================================

create table public.services (
  id uuid primary key default gen_random_uuid(),

  name text not null,
  slug text not null unique,
  description text,

  price integer not null default 15000
    check (price >= 0),

  quota integer
    check (quota is null or quota > 0),

  deadline timestamptz,
  image_url text,
  requirements text,

  is_active boolean not null default true,

  form_config jsonb not null default '{
    "full_name": {
      "label": "Nama lengkap",
      "status": "required"
    },
    "whatsapp": {
      "label": "Nomor WhatsApp",
      "status": "required"
    },
    "faculty": {
      "label": "Fakultas",
      "status": "required"
    },
    "major": {
      "label": "Jurusan / Program Studi",
      "status": "required"
    },
    "nim": {
      "label": "NIM",
      "status": "hidden"
    },
    "group_name": {
      "label": "Kelompok",
      "status": "required"
    },
    "birth_place": {
      "label": "Tempat lahir",
      "status": "optional"
    },
    "birth_date": {
      "label": "Tanggal lahir",
      "status": "optional"
    },
    "address": {
      "label": "Alamat",
      "status": "optional"
    },
    "motto": {
      "label": "Motto hidup",
      "status": "optional"
    },
    "customer_photo": {
      "label": "Foto",
      "status": "required"
    },
    "custom_fields": []
  }'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint services_name_not_empty
    check (char_length(trim(name)) >= 3),

  constraint services_slug_valid
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),

  constraint services_form_config_object
    check (jsonb_typeof(form_config) = 'object')
);


-- ============================================================
-- 3. TABLE FACULTIES
-- ============================================================

create table public.faculties (
  id bigint generated always as identity primary key,

  name text not null unique,
  code text not null unique,

  sort_order integer not null default 0,
  is_active boolean not null default true
);


-- ============================================================
-- 4. TABLE STUDY PROGRAMS
-- ============================================================

create table public.study_programs (
  id bigint generated always as identity primary key,

  faculty_id bigint not null
    references public.faculties(id)
    on delete restrict,

  name text not null,
  degree text not null,

  sort_order integer not null default 0,
  is_active boolean not null default true,

  constraint study_programs_unique
    unique (faculty_id, name, degree)
);


-- ============================================================
-- 5. TABLE ORDERS
-- ============================================================

create table public.orders (
  id uuid primary key default gen_random_uuid(),

  order_code text not null unique
    default public.generate_order_code(),

  service_id uuid not null
    references public.services(id)
    on delete restrict,

  full_name text not null,
  whatsapp text not null,

  faculty text,
  major text,
  nim text,
  group_name text,

  birth_place text,
  birth_date date,
  address text,
  motto text,

  photo_path text,
  payment_proof_path text,

  total_price integer not null default 0
    check (total_price >= 0),

  payment_status text not null default 'menunggu'
    check (
      payment_status in (
        'menunggu',
        'lunas',
        'ditolak'
      )
    ),

  order_status text not null default 'masuk'
    check (
      order_status in (
        'masuk',
        'diproses',
        'selesai',
        'dibatalkan'
      )
    ),

  customer_note text,
  admin_note text,

  terms_accepted boolean not null default false,

  extra_data jsonb not null default '{}'::jsonb
    check (jsonb_typeof(extra_data) = 'object'),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint orders_full_name_not_empty
    check (char_length(trim(full_name)) >= 2),

  constraint orders_whatsapp_not_empty
    check (char_length(trim(whatsapp)) >= 8)
);


-- ============================================================
-- 6. TABLE SETTINGS
-- ============================================================

create table public.settings (
  id integer primary key default 1
    check (id = 1),

  website_name text not null default 'MabaTag',
  whatsapp_number text,

  qris_owner_name text,
  qris_image_url text,

  payment_instruction text,
  terms_and_conditions text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- Hanya satu data awal yang memang dibutuhkan aplikasi.
insert into public.settings (
  id,
  website_name,
  whatsapp_number,
  qris_owner_name,
  qris_image_url,
  payment_instruction,
  terms_and_conditions
)
values (
  1,
  'MabaTag',
  null,
  null,
  null,
  null,
  null
)
on conflict (id) do nothing;


-- ============================================================
-- 7. TRIGGER UPDATED_AT
-- ============================================================

create trigger services_set_updated_at
before update on public.services
for each row
execute function public.set_updated_at();


create trigger orders_set_updated_at
before update on public.orders
for each row
execute function public.set_updated_at();


create trigger settings_set_updated_at
before update on public.settings
for each row
execute function public.set_updated_at();


-- ============================================================
-- 8. TRIGGER PERSIAPAN PESANAN
-- Harga, status, deadline, dan kuota tetap dijaga database.
-- ============================================================

create or replace function public.prepare_new_order()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_service public.services%rowtype;
  active_order_count integer;
begin
  select *
  into selected_service
  from public.services
  where id = new.service_id
  for update;

  if not found then
    raise exception 'Jasa tidak ditemukan.';
  end if;

  if selected_service.is_active = false then
    raise exception 'Jasa sedang tidak aktif.';
  end if;

  if selected_service.deadline is not null
     and now() > selected_service.deadline then
    raise exception 'Batas waktu pemesanan telah berakhir.';
  end if;

  if selected_service.quota is not null then
    select count(*)
    into active_order_count
    from public.orders
    where service_id = new.service_id
      and order_status <> 'dibatalkan';

    if active_order_count >= selected_service.quota then
      raise exception 'Kuota pesanan sudah penuh.';
    end if;
  end if;

  if new.order_code is null or trim(new.order_code) = '' then
    new.order_code := public.generate_order_code();
  else
    new.order_code := upper(trim(new.order_code));
  end if;

  new.total_price := selected_service.price;
  new.payment_status := 'menunggu';
  new.order_status := 'masuk';
  new.admin_note := null;

  return new;
end;
$$;


create trigger orders_prepare_before_insert
before insert on public.orders
for each row
execute function public.prepare_new_order();


-- ============================================================
-- 9. INDEX
-- ============================================================

create index orders_service_id_idx
on public.orders(service_id);

create index orders_created_at_idx
on public.orders(created_at desc);

create index orders_payment_status_idx
on public.orders(payment_status);

create index orders_order_status_idx
on public.orders(order_status);

create index orders_faculty_idx
on public.orders(faculty);

create index orders_major_idx
on public.orders(major);

create index services_active_idx
on public.services(is_active);

create index services_deadline_idx
on public.services(deadline);

create index study_programs_faculty_id_idx
on public.study_programs(faculty_id);


-- ============================================================
-- 10. ENABLE RLS
-- ============================================================

alter table public.services enable row level security;
alter table public.orders enable row level security;
alter table public.settings enable row level security;
alter table public.faculties enable row level security;
alter table public.study_programs enable row level security;


-- ============================================================
-- 11. RLS SERVICES
-- ============================================================

create policy "Public membaca jasa aktif"
on public.services
for select
to anon, authenticated
using (is_active = true);


create policy "Admin membaca semua jasa"
on public.services
for select
to authenticated
using (true);


create policy "Admin menambah jasa"
on public.services
for insert
to authenticated
with check (true);


create policy "Admin mengubah jasa"
on public.services
for update
to authenticated
using (true)
with check (true);


create policy "Admin menghapus jasa"
on public.services
for delete
to authenticated
using (true);


-- ============================================================
-- 12. RLS ORDERS
-- ============================================================

create policy "Public membuat pesanan"
on public.orders
for insert
to anon
with check (
  terms_accepted = true
  and payment_status = 'menunggu'
  and order_status = 'masuk'
  and admin_note is null
);


create policy "Admin membaca pesanan"
on public.orders
for select
to authenticated
using (true);


create policy "Admin menambah pesanan"
on public.orders
for insert
to authenticated
with check (true);


create policy "Admin mengubah pesanan"
on public.orders
for update
to authenticated
using (true)
with check (true);


create policy "Admin menghapus pesanan"
on public.orders
for delete
to authenticated
using (true);


-- ============================================================
-- 13. RLS SETTINGS
-- ============================================================

create policy "Public membaca settings"
on public.settings
for select
to anon, authenticated
using (id = 1);


create policy "Admin mengubah settings"
on public.settings
for update
to authenticated
using (id = 1)
with check (id = 1);


-- ============================================================
-- 14. RLS FACULTIES
-- ============================================================

create policy "Public membaca fakultas aktif"
on public.faculties
for select
to anon, authenticated
using (is_active = true);


create policy "Admin mengelola fakultas"
on public.faculties
for all
to authenticated
using (true)
with check (true);


-- ============================================================
-- 15. RLS STUDY PROGRAMS
-- ============================================================

create policy "Public membaca program studi aktif"
on public.study_programs
for select
to anon, authenticated
using (is_active = true);


create policy "Admin mengelola program studi"
on public.study_programs
for all
to authenticated
using (true)
with check (true);


-- ============================================================
-- 16. STORAGE POLICIES
-- Bucket harus dibuat manual lebih dulu:
-- public-assets = public
-- order-files  = private
-- ============================================================

create policy "Public membaca public assets"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'public-assets');


create policy "Admin upload public assets"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'public-assets');


create policy "Admin update public assets"
on storage.objects
for update
to authenticated
using (bucket_id = 'public-assets')
with check (bucket_id = 'public-assets');


create policy "Admin delete public assets"
on storage.objects
for delete
to authenticated
using (bucket_id = 'public-assets');


create policy "Public upload order files"
on storage.objects
for insert
to anon
with check (
  bucket_id = 'order-files'
  and (storage.foldername(name))[1] = 'orders'
);


create policy "Admin membaca order files"
on storage.objects
for select
to authenticated
using (bucket_id = 'order-files');


create policy "Admin upload order files"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'order-files');


create policy "Admin update order files"
on storage.objects
for update
to authenticated
using (bucket_id = 'order-files')
with check (bucket_id = 'order-files');


create policy "Admin delete order files"
on storage.objects
for delete
to authenticated
using (bucket_id = 'order-files');


-- ============================================================
-- 17. GRANTS
-- ============================================================

grant usage on schema public
to anon, authenticated;


grant select
on public.services,
   public.settings,
   public.faculties,
   public.study_programs
to anon;


grant insert
on public.orders
to anon;


grant select, insert, update, delete
on public.services,
   public.orders,
   public.faculties,
   public.study_programs
to authenticated;


grant select, update
on public.settings
to authenticated;


grant usage, select
on all sequences in schema public
to authenticated;


-- ============================================================
-- SELESAI
-- ============================================================
