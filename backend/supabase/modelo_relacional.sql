create extension if not exists pgcrypto;

drop table if exists public.intentos cascade;
drop table if exists public.partidas cascade;
drop table if exists public.ecuaciones cascade;
drop table if exists public.usuarios cascade;

create table public.usuarios (
  id uuid primary key default gen_random_uuid(),
  nombre_jugador varchar(50) not null unique,
  created_at timestamptz not null default now(),
  constraint usuarios_nombre_chk
    check (char_length(btrim(nombre_jugador)) between 1 and 50)
);

create table public.ecuaciones (
  id bigserial primary key,
  expresion varchar(7) not null unique,
  dificultad varchar(10) not null,
  activa boolean not null default true,
  created_at timestamptz not null default now(),
  constraint ecuaciones_longitud_chk
    check (char_length(expresion) = 7),
  constraint ecuaciones_dificultad_chk
    check (dificultad in ('normal', 'dificil'))
);

create table public.partidas (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid null references public.usuarios(id) on delete set null,
  ecuacion_id bigint references public.ecuaciones(id) on delete set null,
  ecuacion_jugada varchar(7) not null,
  dificultad varchar(10) not null,
  estado varchar(12) not null,
  intentos_usados int not null default 0,
  puntaje int not null default 0,
  created_at timestamptz not null default now(),
  finished_at timestamptz null,
  constraint partidas_estado_chk
    check (estado in ('victoria', 'derrota', 'abandonada')),
  constraint partidas_dificultad_chk
    check (dificultad in ('normal', 'dificil')),
  constraint partidas_intentos_chk
    check (intentos_usados between 0 and 6),
  constraint partidas_ecuacion_longitud_chk
    check (char_length(ecuacion_jugada) = 7)
);

create index if not exists partidas_ranking_idx
  on public.partidas (puntaje desc, created_at asc);

alter table public.usuarios enable row level security;
alter table public.ecuaciones enable row level security;
alter table public.partidas enable row level security;

drop policy if exists usuarios_select_public on public.usuarios;
create policy usuarios_select_public
  on public.usuarios
  for select
  using (true);

drop policy if exists usuarios_insert_public on public.usuarios;
create policy usuarios_insert_public
  on public.usuarios
  for insert
  with check (true);

drop policy if exists usuarios_update_public on public.usuarios;
create policy usuarios_update_public
  on public.usuarios
  for update
  using (true);

drop policy if exists ecuaciones_select_public on public.ecuaciones;
create policy ecuaciones_select_public
  on public.ecuaciones
  for select
  using (true);

drop policy if exists partidas_insert_public on public.partidas;
create policy partidas_insert_public
  on public.partidas
  for insert
  with check (true);

drop policy if exists partidas_select_public on public.partidas;
create policy partidas_select_public
  on public.partidas
  for select
  using (true);

drop policy if exists partidas_update_public on public.partidas;
create policy partidas_update_public
  on public.partidas
  for update
  using (true);
