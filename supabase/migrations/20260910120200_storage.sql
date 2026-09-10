-- Storage für Beleg-PDFs (AP-00.2)
-- Pfadkonvention: receipts/<submission_id>/<datei>.pdf

insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', false)
on conflict (id) do nothing;

-- Admin: voller Zugriff auf den receipts-Bucket
create policy "storage receipts: admin alles" on storage.objects
  for all to authenticated
  using (bucket_id = 'receipts' and public.is_admin())
  with check (bucket_id = 'receipts' and public.is_admin());

-- Kunde: darf den Beleg zur eigenen Einreichung lesen
-- (erster Pfadsegment = submission_id).
create policy "storage receipts: eigenen beleg lesen" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'receipts'
    and exists (
      select 1 from public.submissions s
      where s.id::text = (storage.foldername(name))[1]
        and s.user_id = (select auth.uid())
    )
  );
