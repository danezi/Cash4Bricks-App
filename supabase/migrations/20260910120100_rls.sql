-- Row-Level-Security (AP-00.2)
-- Grundsatz: Default-Deny. Kunde sieht nur eigene Datensätze, Admin sieht alles.
-- Edge Functions nutzen später den service_role-Key und umgehen RLS bewusst.

-- ── Helfer ─────────────────────────────────────────────────────────────────
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

-- ── RLS aktivieren ─────────────────────────────────────────────────────────
alter table public.profiles            enable row level security;
alter table public.submissions         enable row level security;
alter table public.submission_items    enable row level security;
alter table public.goods_receipt_scans enable row level security;
alter table public.adjustments         enable row level security;
alter table public.receipts            enable row level security;
alter table public.catalog_sets        enable row level security;
alter table public.catalog_barcodes    enable row level security;

-- ── profiles ───────────────────────────────────────────────────────────────
create policy "profiles: eigene lesen" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or public.is_admin());

create policy "profiles: eigene aendern" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- ── submissions ────────────────────────────────────────────────────────────
create policy "submissions: eigene oder admin lesen" on public.submissions
  for select to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());

create policy "submissions: selbst anlegen" on public.submissions
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "submissions: nur admin aendern" on public.submissions
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ── submission_items ───────────────────────────────────────────────────────
create policy "items: zur eigenen einreichung oder admin lesen" on public.submission_items
  for select to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.submissions s
      where s.id = submission_id and s.user_id = (select auth.uid())
    )
  );

create policy "items: zur eigenen einreichung anlegen" on public.submission_items
  for insert to authenticated
  with check (
    exists (
      select 1 from public.submissions s
      where s.id = submission_id and s.user_id = (select auth.uid())
    )
  );

create policy "items: nur admin aendern" on public.submission_items
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ── goods_receipt_scans — nur Admin ────────────────────────────────────────
create policy "wareneingang: nur admin" on public.goods_receipt_scans
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ── adjustments — append-only: Admin darf lesen und einfügen, nicht ändern ─
create policy "anpassungen: admin lesen" on public.adjustments
  for select to authenticated
  using (public.is_admin());

create policy "anpassungen: admin einfuegen" on public.adjustments
  for insert to authenticated
  with check (public.is_admin());

-- ── receipts ───────────────────────────────────────────────────────────────
create policy "belege: eigene oder admin lesen" on public.receipts
  for select to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.submissions s
      where s.id = submission_id and s.user_id = (select auth.uid())
    )
  );

create policy "belege: nur admin schreiben" on public.receipts
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ── Katalog — jeder Angemeldete darf lesen, nur Admin schreiben ────────────
create policy "katalog-sets: lesen" on public.catalog_sets
  for select to authenticated using (true);
create policy "katalog-sets: admin schreiben" on public.catalog_sets
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "katalog-barcodes: lesen" on public.catalog_barcodes
  for select to authenticated using (true);
create policy "katalog-barcodes: admin schreiben" on public.catalog_barcodes
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
