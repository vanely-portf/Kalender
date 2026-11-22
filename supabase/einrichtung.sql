-- ------------------------------------------------------------
-- Friendlender – Datenbank einrichten (Supabase → SQL Editor → Run)
-- ------------------------------------------------------------
-- Kein Login: Alle mit der App dürfen lesen und schreiben – wie ein
-- gemeinsamer Kalender im Freundeskreis. Das regeln die Policies unten.

-- Personen: ein Profil pro Gerät (id = Geräte-ID)
create table if not exists public.personen (
  id          text primary key,
  name        text not null check (char_length(name) between 1 and 40),
  farbe       text not null default '#799DAC',
  geraet      boolean not null default true,
  erstellt    timestamptz not null default now()
);

-- Einträge: Termine, Ferien, Einladungen
create table if not exists public.eintraege (
  id          text primary key,
  name        text not null,                       -- wer den Eintrag gemacht hat
  start       date not null,
  ende        date not null,
  status      text not null check (status in ('frei','besetzt','arbeiten','arzt','ferien','treffen')),
  von         text not null default '',            -- "HH:MM" oder leer
  bis         text not null default '',
  notiz       text not null default '',            -- Titel
  eingeladen  text[] not null default '{}',        -- Namen der Eingeladenen
  antworten   jsonb  not null default '{}'::jsonb, -- { "Anna": "ja", "Pyro": "nein" }
  erstellt    bigint not null default (extract(epoch from now()) * 1000)::bigint,
  constraint ende_nach_start check (ende >= start)
);

-- Push-Anmeldungen: eine pro Gerät; verschwindet automatisch mit dem Profil
create table if not exists public.push (
  id          text primary key references public.personen(id) on delete cascade,
  abo         jsonb not null,
  aktualisiert timestamptz not null default now()
);

-- Antwort auf eine Einladung setzen, ohne andere Antworten zu überschreiben
create or replace function public.antwort_setzen(p_id text, p_name text, p_antwort text)
returns void
language sql
as $$
  update public.eintraege
     set antworten = antworten || jsonb_build_object(p_name, p_antwort)
   where id = p_id and p_antwort in ('ja', 'nein');
$$;

-- Zugriff für die App (Rolle "anon" = ohne Login)
alter table public.personen  enable row level security;
alter table public.eintraege enable row level security;
alter table public.push      enable row level security;

drop policy if exists "alle duerfen alles" on public.personen;
drop policy if exists "alle duerfen alles" on public.eintraege;
drop policy if exists "alle duerfen alles" on public.push;
create policy "alle duerfen alles" on public.personen  for all to anon, authenticated using (true) with check (true);
create policy "alle duerfen alles" on public.eintraege for all to anon, authenticated using (true) with check (true);
create policy "alle duerfen alles" on public.push      for all to anon, authenticated using (true) with check (true);

grant select, insert, update, delete on public.personen, public.eintraege, public.push to anon, authenticated;
grant execute on function public.antwort_setzen(text, text, text) to anon, authenticated;

-- Live-Updates (Realtime) für Personen und Einträge einschalten
do $$
begin
  begin alter publication supabase_realtime add table public.personen;  exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.eintraege; exception when duplicate_object then null; end;
end $$;
