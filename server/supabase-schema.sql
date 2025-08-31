-- MangoLeads v2 Supabase Schema
-- Run this in your Supabase SQL editor

-- 1) Leads
create table if not exists public.leads (
  id              bigserial primary key,
  first_name      text,
  last_name       text,
  email           text,
  phonecc         text,
  phone           text,
  country         text,
  user_ip         text,
  utm_source      text,
  utm_medium      text,
  utm_campaign    text,
  status          text not null default 'queued',  -- queued | sent | failed
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- 2) Brands (high‑level)
create table if not exists public.brands (
  id          bigserial primary key,
  name        text not null,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- 3) Integrations (one per brand or multiple variants per brand)
create table if not exists public.integrations (
  id              bigserial primary key,
  brand_id        bigint references public.brands(id) on delete cascade,
  api_url         text not null,
  method          text not null default 'POST',     -- POST/GET
  auth_type       text not null default 'none',     -- none|bearer|basic|apiKeyHeader
  auth_value      text,                             -- token or base64(user:pass) or header value
  api_key_header  text,                             -- name of header if auth_type=apiKeyHeader
  field_mapping   jsonb not null default '{}'::jsonb,  -- {externalField: internalField}
  required_fields text[] not null default '{}',
  timeout_ms      int not null default 10000,
  active          boolean not null default true,
  created_at      timestamptz not null default now()
);

-- 4) Dispatch rules (optional; default is ALL active integrations)
create table if not exists public.dispatch_rules (
  id           bigserial primary key,
  brand_id     bigint references public.brands(id) on delete cascade,
  country_whitelist text[],            -- e.g. ['US','IT']
  active       boolean not null default true
);

-- 5) Logs per attempt
create table if not exists public.integration_logs (
  id              bigserial primary key,
  lead_id         bigint references public.leads(id) on delete cascade,
  integration_id  bigint references public.integrations(id) on delete cascade,
  status          text not null,                 -- sent|failed
  http_code       int,
  duration_ms     int,
  response_body   text,
  created_at      timestamptz not null default now()
);

-- helpful indexes
create index if not exists idx_leads_status on public.leads(status);
create index if not exists idx_logs_lead on public.integration_logs(lead_id);
create index if not exists idx_integrations_active on public.integrations(active);

-- Sample seed data
insert into public.brands (id, name, active) values
  (1000, 'Mock Trading Test', true)
  on conflict (id) do nothing;

insert into public.integrations (brand_id, api_url, method, auth_type, field_mapping, required_fields, active)
values
  (1000, 'https://httpbin.org/post', 'POST', 'none',
   '{"firstName":"first_name","lastName":"last_name","email":"email","phone":"phone","country":"country"}',
   '{email,country}', true)
on conflict do nothing;
