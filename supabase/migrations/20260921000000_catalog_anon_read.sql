-- Katalog-Lesezugriff für anonyme Nutzer freigeben (AP-1.2)
-- ─────────────────────────────────────────────────────────────────────────
-- M1 (Scan + Set-Suche) hat bewusst noch kein Login (Auth kommt erst in M2,
-- AP-2.1). Die bisherige Policy "katalog-sets: lesen" verlangt `authenticated`
-- und würde den anonymen Kunden-Flow blockieren, sobald der echte
-- Supabase-Adapter (statt Mock) `catalog.searchSets` direkt gegen diese
-- Tabelle abfragt. catalog_sets enthält keine personenbezogenen Daten —
-- reines Lesen ist unkritisch. Schreiben bleibt Admin vorbehalten
-- (Policy "katalog-sets: admin schreiben", unverändert).
--
-- catalog_barcodes bleibt bewusst unverändert (weiterhin nur `authenticated`
-- lesbar): Barcode-Auflösung läuft laut Umsetzungsplan über die
-- `barcode-lookup`-Edge-Function mit dem service_role-Key, der RLS ohnehin
-- umgeht — der Client liest diese Tabelle nie direkt.

drop policy "katalog-sets: lesen" on public.catalog_sets;
create policy "katalog-sets: lesen" on public.catalog_sets
  for select to anon, authenticated using (true);
