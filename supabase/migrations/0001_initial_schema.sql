create extension if not exists pgcrypto;

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text unique not null check (name in ('admin', 'marca', 'client', 'tendero', 'delivery')),
  created_at timestamptz not null default now()
);

insert into public.roles (name)
values ('admin'), ('marca'), ('client'), ('tendero'), ('delivery')
on conflict (name) do nothing;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  role_id uuid not null references public.roles(id),
  email text unique not null,
  full_name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.register (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.login (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_user_id uuid references public.users(id),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.stores (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.users(id),
  name text not null,
  address text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid references public.stores(id),
  brand_id uuid references public.brands(id),
  name text not null,
  description text,
  price numeric(12,2) not null,
  stock integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  client_user_id uuid references public.users(id),
  store_id uuid references public.stores(id),
  status text not null default 'pending' check (status in ('pending','accepted','preparing','ready','assigned','delivered','cancelled')),
  total numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  quantity integer not null,
  unit_price numeric(12,2) not null
);

create table if not exists public.deliveries (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id),
  delivery_user_id uuid references public.users(id),
  status text not null default 'assigned' check (status in ('assigned','picked_up','on_route','delivered','failed')),
  created_at timestamptz not null default now()
);

create index if not exists users_role_id_idx on public.users(role_id);
create index if not exists register_user_id_idx on public.register(user_id);
create index if not exists login_user_id_idx on public.login(user_id);
create index if not exists brands_owner_user_id_idx on public.brands(owner_user_id);
create index if not exists stores_owner_user_id_idx on public.stores(owner_user_id);
create index if not exists products_store_id_idx on public.products(store_id);
create index if not exists products_brand_id_idx on public.products(brand_id);
create index if not exists orders_client_user_id_idx on public.orders(client_user_id);
create index if not exists orders_store_id_idx on public.orders(store_id);
create index if not exists deliveries_delivery_user_id_idx on public.deliveries(delivery_user_id);

alter table public.roles enable row level security;
alter table public.users enable row level security;
alter table public.register enable row level security;
alter table public.login enable row level security;
alter table public.brands enable row level security;
alter table public.stores enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.deliveries enable row level security;
