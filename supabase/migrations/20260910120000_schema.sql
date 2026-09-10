-- Cash4Bricks — eigenes Datenmodell (AP-00.2)
-- Neu entworfen als Migrationen; keine Übernahme des cash-4-bricks-Schemas.

-- ── Aufzählungen ────────────────────────────────────────────────────────────
create type public.user_role as enum ('customer', 'admin');

create type public.submission_status as enum (
  'submitted',
  'under_review',
  'offer_sent',
  'accepted',
  'received',
  'payment_initiated',
  'paid'
);

create type public.line_status as enum ('requested', 'received', 'missing', 'extra');

create type public.item_source as enum ('scan', 'manual');

-- ── profiles ───────────────────────────────────────────────────────────────
-- Ein Datensatz je Auth-Nutzer, wird per Trigger angelegt.
create table public.profiles (
  id             uuid primary key references auth.users (id) on delete cascade,
  role           public.user_role not null default 'customer',
  email          text,
  phone_whatsapp text,
  referral_code  text unique,
  created_at     timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, referral_code)
  values (
    new.id,
    new.email,
    'C4B-' || upper(substr(replace(new.id::text, '-', ''), 1, 6))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ── submissions ────────────────────────────────────────────────────────────
create table public.submissions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  status          public.submission_status not null default 'submitted',
  contact_email   text not null,
  contact_phone   text not null,
  referral_used   text,
  total_estimated numeric(10, 2) not null default 0,
  total_final     numeric(10, 2),
  created_at      timestamptz not null default now()
);
create index submissions_user_id_idx on public.submissions (user_id);
create index submissions_status_created_idx on public.submissions (status, created_at desc);

-- ── submission_items ───────────────────────────────────────────────────────
create table public.submission_items (
  id              uuid primary key default gen_random_uuid(),
  submission_id   uuid not null references public.submissions (id) on delete cascade,
  set_number      text not null,
  set_name        text not null,
  qty             integer not null check (qty > 0),
  qty_received    integer not null default 0 check (qty_received >= 0),
  source          public.item_source not null,
  line_status     public.line_status not null default 'requested',
  price_estimated numeric(10, 2),
  price_final     numeric(10, 2)
);
create index submission_items_submission_id_idx on public.submission_items (submission_id);

-- ── goods_receipt_scans ────────────────────────────────────────────────────
create table public.goods_receipt_scans (
  id            uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions (id) on delete cascade,
  set_number    text not null,
  qty_received  integer not null default 1 check (qty_received > 0),
  scanned_by    uuid references auth.users (id),
  scanned_at    timestamptz not null default now()
);
create index goods_receipt_scans_submission_id_idx on public.goods_receipt_scans (submission_id);

-- ── adjustments (append-only) ──────────────────────────────────────────────
create table public.adjustments (
  id            uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions (id) on delete cascade,
  amount        numeric(10, 2) not null,
  reason        text not null check (length(reason) >= 3),
  created_by    uuid references auth.users (id),
  created_at    timestamptz not null default now()
);
create index adjustments_submission_id_idx on public.adjustments (submission_id);

-- ── receipts ───────────────────────────────────────────────────────────────
create table public.receipts (
  id            uuid primary key default gen_random_uuid(),
  submission_id uuid not null unique references public.submissions (id) on delete cascade,
  pdf_url       text,
  final_amount  numeric(10, 2) not null,
  issued_at     timestamptz not null default now()
);

-- ── Katalog (Rebrickable-Spiegel + selbstlernender Barcode-Index) ──────────
create table public.catalog_sets (
  set_number text primary key,
  name       text not null,
  year       integer,
  theme      text,
  parts      integer,
  image_url  text,
  updated_at timestamptz not null default now()
);

create table public.catalog_barcodes (
  ean          text primary key,
  set_number   text not null references public.catalog_sets (set_number) on delete cascade,
  source       text,
  confidence   real not null default 1 check (confidence >= 0 and confidence <= 1),
  confirmed_at timestamptz,
  updated_at   timestamptz not null default now()
);
create index catalog_barcodes_set_number_idx on public.catalog_barcodes (set_number);
