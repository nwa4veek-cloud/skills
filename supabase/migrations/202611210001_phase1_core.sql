create extension if not exists pgcrypto;

create or replace function public.is_phone_match_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

revoke all on function public.is_phone_match_admin() from public;
grant execute on function public.is_phone_match_admin() to authenticated;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  brand text not null check (char_length(brand) between 1 and 80),
  model text not null check (char_length(model) between 1 and 120),
  name text not null check (char_length(name) between 1 and 160),
  price integer not null check (price > 0),
  condition text not null check (condition in ('NEW', 'LONDON_USED')),
  ram text,
  storage text,
  processor text,
  display text,
  camera text,
  battery text,
  battery_health integer check (battery_health between 1 and 100),
  physical_condition text,
  warranty text,
  image_path text,
  available boolean not null default true,
  active boolean not null default true,
  description text not null check (char_length(description) between 1 and 2000),
  matching_attributes jsonb not null check (
    jsonb_typeof(matching_attributes) = 'object'
    and (matching_attributes ?& array['camera', 'battery', 'performance', 'storage', 'display', 'durability', 'value'])
    and (matching_attributes - array['camera', 'battery', 'performance', 'storage', 'display', 'durability', 'value']::text[]) = '{}'::jsonb
    and coalesce(jsonb_typeof(matching_attributes -> 'camera') = 'number', false)
    and coalesce((matching_attributes ->> 'camera')::integer between 1 and 5, false)
    and coalesce((matching_attributes ->> 'camera')::numeric % 1 = 0, false)
    and coalesce(jsonb_typeof(matching_attributes -> 'battery') = 'number', false)
    and coalesce((matching_attributes ->> 'battery')::integer between 1 and 5, false)
    and coalesce((matching_attributes ->> 'battery')::numeric % 1 = 0, false)
    and coalesce(jsonb_typeof(matching_attributes -> 'performance') = 'number', false)
    and coalesce((matching_attributes ->> 'performance')::integer between 1 and 5, false)
    and coalesce((matching_attributes ->> 'performance')::numeric % 1 = 0, false)
    and coalesce(jsonb_typeof(matching_attributes -> 'storage') = 'number', false)
    and coalesce((matching_attributes ->> 'storage')::integer between 1 and 5, false)
    and coalesce((matching_attributes ->> 'storage')::numeric % 1 = 0, false)
    and coalesce(jsonb_typeof(matching_attributes -> 'display') = 'number', false)
    and coalesce((matching_attributes ->> 'display')::integer between 1 and 5, false)
    and coalesce((matching_attributes ->> 'display')::numeric % 1 = 0, false)
    and coalesce(jsonb_typeof(matching_attributes -> 'durability') = 'number', false)
    and coalesce((matching_attributes ->> 'durability')::integer between 1 and 5, false)
    and coalesce((matching_attributes ->> 'durability')::numeric % 1 = 0, false)
    and coalesce(jsonb_typeof(matching_attributes -> 'value') = 'number', false)
    and coalesce((matching_attributes ->> 'value')::integer between 1 and 5, false)
    and coalesce((matching_attributes ->> 'value')::numeric % 1 = 0, false)
  ),
  usage_suitability jsonb not null check (
    jsonb_typeof(usage_suitability) = 'object'
    and (usage_suitability ?& array['social', 'photography', 'gaming', 'business', 'content', 'general'])
    and (usage_suitability - array['social', 'photography', 'gaming', 'business', 'content', 'general']::text[]) = '{}'::jsonb
    and coalesce((usage_suitability ->> 'social') in ('exact', 'related', 'general', 'none'), false)
    and coalesce((usage_suitability ->> 'photography') in ('exact', 'related', 'general', 'none'), false)
    and coalesce((usage_suitability ->> 'gaming') in ('exact', 'related', 'general', 'none'), false)
    and coalesce((usage_suitability ->> 'business') in ('exact', 'related', 'general', 'none'), false)
    and coalesce((usage_suitability ->> 'content') in ('exact', 'related', 'general', 'none'), false)
    and coalesce((usage_suitability ->> 'general') in ('exact', 'related', 'general', 'none'), false)
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_active_available_price_idx
  on public.products (active, available, price);

create table if not exists public.quiz_submissions (
  id uuid primary key default gen_random_uuid(),
  budget integer not null check (budget > 0),
  budget_label text not null,
  priorities jsonb not null check (jsonb_typeof(priorities) = 'array' and jsonb_array_length(priorities) = 2),
  usage text not null check (usage in ('social', 'photography', 'gaming', 'business', 'content', 'general')),
  condition_preference text not null check (condition_preference in ('NEW_ONLY', 'LONDON_USED_ONLY', 'BOTH')),
  flexibility text not null check (flexibility in ('STRICT', 'SLIGHT', 'FLEXIBLE')),
  created_at timestamptz not null default now()
);

create table if not exists public.recommendations (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.quiz_submissions(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  score integer not null check (score between 0 and 100),
  classification text not null check (classification in ('Excellent Match', 'Good Match', 'Fair Match', 'Weak Match')),
  explanation text not null,
  created_at timestamptz not null default now(),
  unique (submission_id, product_id)
);

create index if not exists recommendations_submission_created_idx
  on public.recommendations (submission_id, created_at);

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null check (event_name in ('quiz_started', 'quiz_submitted', 'whatsapp_clicked')),
  product_id uuid references public.products(id) on delete set null,
  submission_id uuid references public.quiz_submissions(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_name_created_idx
  on public.analytics_events (event_name, created_at);

create or replace function public.set_phone_match_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_phone_match_updated_at();

create table if not exists public.app_settings (
  key text primary key check (char_length(key) between 1 and 80),
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create trigger app_settings_set_updated_at
  before update on public.app_settings
  for each row execute function public.set_phone_match_updated_at();

insert into public.app_settings (key, value)
values
  ('whatsapp_number', to_jsonb(coalesce(nullif(current_setting('app.settings.whatsapp_number', true), ''), ''))),
  ('budget_ranges', '[
    {"label":"Below ₦100,000","min":1,"max":99999},
    {"label":"₦100,000–₦150,000","min":100000,"max":150000},
    {"label":"₦150,000–₦200,000","min":150001,"max":200000},
    {"label":"₦200,000–₦300,000","min":200001,"max":300000},
    {"label":"₦300,000–₦500,000","min":300001,"max":500000},
    {"label":"Above ₦500,000","min":500001,"max":100000000},
    {"label":"Enter a custom budget","min":1,"max":100000000}
  ]'::jsonb),
  ('recommendation_config', '{
    "flexibilityPercentages":{"STRICT":0,"SLIGHT":10,"FLEXIBLE":20},
    "weights":{"priorityOne":0.35,"priorityTwo":0.35,"usage":0.20,"budget":0.10},
    "minimumScore":55,
    "thresholds":{"excellent":85,"good":70,"fair":55}
  }'::jsonb)
on conflict (key) do nothing;

alter table public.products enable row level security;
alter table public.quiz_submissions enable row level security;
alter table public.recommendations enable row level security;
alter table public.analytics_events enable row level security;
alter table public.app_settings enable row level security;

create policy "Admins can manage products"
  on public.products for all to authenticated
  using (public.is_phone_match_admin())
  with check (public.is_phone_match_admin());

create policy "Admins can read quiz submissions"
  on public.quiz_submissions for select to authenticated
  using (public.is_phone_match_admin());

create policy "Admins can read recommendations"
  on public.recommendations for select to authenticated
  using (public.is_phone_match_admin());

create policy "Admins can read analytics"
  on public.analytics_events for select to authenticated
  using (public.is_phone_match_admin());

create policy "Admins can read app settings"
  on public.app_settings for select to authenticated
  using (public.is_phone_match_admin());

create policy "Admins can update app settings"
  on public.app_settings for update to authenticated
  using (public.is_phone_match_admin())
  with check (public.is_phone_match_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 3145728, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "Product images are publicly viewable"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'product-images');

create policy "Admins can upload product images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_phone_match_admin());

create policy "Admins can update product images"
  on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and public.is_phone_match_admin())
  with check (bucket_id = 'product-images' and public.is_phone_match_admin());

create policy "Admins can delete product images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and public.is_phone_match_admin());
