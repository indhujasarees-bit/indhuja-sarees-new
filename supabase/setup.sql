create extension if not exists pgcrypto;

create table if not exists public.collections(
 id uuid primary key default gen_random_uuid(),
 name text not null unique,
 sort_order int not null default 0,
 is_active boolean not null default true,
 created_at timestamptz not null default now()
);

create table if not exists public.products(
 id uuid primary key default gen_random_uuid(),
 code text not null unique,
 name text not null,
 collection_id uuid references public.collections(id) on delete set null,
 price numeric(12,2) not null default 0,
 description text not null default '',
 image_url text not null default '',
 is_active boolean not null default true,
 created_at timestamptz not null default now()
);

alter table public.collections enable row level security;
alter table public.products enable row level security;

drop policy if exists "public collections" on public.collections;
create policy "public collections" on public.collections for select to anon,authenticated using(is_active=true);
drop policy if exists "auth collections" on public.collections;
create policy "auth collections" on public.collections for all to authenticated using(true) with check(true);

drop policy if exists "public products" on public.products;
create policy "public products" on public.products for select to anon,authenticated using(is_active=true);
drop policy if exists "auth products" on public.products;
create policy "auth products" on public.products for all to authenticated using(true) with check(true);

insert into public.collections(name,sort_order) values('New Collection',1) on conflict(name) do nothing;

insert into storage.buckets(id,name,public) values('sarees','sarees',true)
on conflict(id) do update set public=true;

drop policy if exists "public saree images" on storage.objects;
create policy "public saree images" on storage.objects for select using(bucket_id='sarees');
drop policy if exists "auth upload saree images" on storage.objects;
create policy "auth upload saree images" on storage.objects for insert to authenticated with check(bucket_id='sarees');
drop policy if exists "auth update saree images" on storage.objects;
create policy "auth update saree images" on storage.objects for update to authenticated using(bucket_id='sarees') with check(bucket_id='sarees');
drop policy if exists "auth delete saree images" on storage.objects;
create policy "auth delete saree images" on storage.objects for delete to authenticated using(bucket_id='sarees');


-- OFFER ZONE
create table if not exists public.offers(
 id uuid primary key default gen_random_uuid(),
 title text not null,
 subtitle text not null default '',
 image_url text not null default '',
 link_url text not null default '',
 sort_order int not null default 0,
 is_active boolean not null default true,
 created_at timestamptz not null default now()
);

alter table public.offers enable row level security;

drop policy if exists "public offers" on public.offers;
create policy "public offers" on public.offers
for select to anon, authenticated
using (is_active = true);

drop policy if exists "auth offers" on public.offers;
create policy "auth offers" on public.offers
for all to authenticated
using (true) with check (true);

-- HOME PAGE EDITOR: editable customer homepage text and section visibility
create table if not exists public.site_settings(
  id int primary key default 1 check (id = 1),
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.site_settings enable row level security;
drop policy if exists "public read site settings" on public.site_settings;
create policy "public read site settings" on public.site_settings for select to anon, authenticated using (true);
drop policy if exists "authenticated manage site settings" on public.site_settings;
create policy "authenticated manage site settings" on public.site_settings for all to authenticated using (true) with check (true);
insert into public.site_settings(id,settings) values (1,'{}'::jsonb) on conflict(id) do nothing;
