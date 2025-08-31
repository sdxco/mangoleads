-- MangoLeads v2 Enhanced Database Schema
-- Based on industry best practices for lead routing CRM

-- 1) Enhanced Leads table with all required fields
CREATE TABLE IF NOT EXISTS leads (
  id              bigserial primary key,
  first_name      text not null,
  last_name       text default '',
  email           text not null,
  phonecc         text default '',
  phone           text default '',
  country         text not null, -- ISO-2
  region          text default '',
  city            text default '',
  timezone        text default '',
  
  -- Acquisition tracking
  utm_source      text default '',
  utm_medium      text default '',
  utm_campaign    text default '',
  utm_term        text default '',
  utm_content     text default '',
  landing_page_url text default '',
  referrer_url    text default '',
  
  -- Technical
  user_ip         text default '',
  user_agent      text default '',
  gclid           text default '',
  fbclid          text default '',
  
  -- Consent & Compliance
  consent_marketing boolean default false,
  consent_timestamp timestamptz,
  consent_ip      text default '',
  
  -- Status & tracking
  status          text not null default 'queued',  -- queued|sent|failed|rejected|duplicate
  duplicate_of    bigint references leads(id),
  quality_score   integer default 0,
  
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- 2) Brands table (high-level organization)
CREATE TABLE IF NOT EXISTS brands (
  id          bigserial primary key,
  name        text not null unique,
  active      boolean not null default true,
  description text default '',
  
  -- SLA settings
  expected_response_codes text[] default '{200,201}',
  throttle_ms integer default 0,
  working_hours jsonb default '{"start":"09:00","end":"17:00","timezone":"UTC"}',
  daily_cap   integer default 1000,
  
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 3) Enhanced Integrations
CREATE TABLE IF NOT EXISTS integrations (
  id              bigserial primary key,
  brand_id        bigint references brands(id) on delete cascade,
  name            text not null,
  api_url         text not null,
  method          text not null default 'POST',     -- POST|GET|PUT
  timeout_ms      integer not null default 10000,
  
  -- Authentication
  auth_type       text not null default 'none',     -- none|bearer|basic|apiKeyHeader
  auth_value      text default '',                  -- encrypted token
  api_key_header  text default '',                  -- header name if auth_type=apiKeyHeader
  
  -- Field mapping and validation
  field_mapping   jsonb not null default '{}'::jsonb,  -- {externalField: internalField}
  required_fields text[] not null default '{}',
  
  -- Routing controls
  country_whitelist text[] default '{}',           -- empty = all countries
  min_lead_age_hours integer default 0,
  max_lead_age_hours integer default 24,
  
  -- Status
  active          boolean not null default true,
  priority        integer default 1,               -- 1=highest
  
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- 4) Dispatch Rules (advanced routing)
CREATE TABLE IF NOT EXISTS dispatch_rules (
  id           bigserial primary key,
  brand_id     bigint references brands(id) on delete cascade,
  name         text not null,
  
  -- Conditions
  country_whitelist text[] default '{}',
  utm_source_match text default '',
  quality_score_min integer default 0,
  
  -- Actions
  integration_priority jsonb default '{}', -- {integration_id: priority}
  
  active       boolean not null default true,
  created_at   timestamptz not null default now()
);

-- 5) Enhanced Integration Logs
CREATE TABLE IF NOT EXISTS integration_logs (
  id              bigserial primary key,
  lead_id         bigint references leads(id) on delete cascade,
  integration_id  bigint references integrations(id) on delete cascade,
  
  -- Attempt details
  attempt_number  integer default 1,
  status          text not null,                 -- sent|failed|retry_scheduled
  http_code       integer,
  duration_ms     integer,
  
  -- Request/Response data
  request_payload jsonb,
  response_body   text,
  error_message   text default '',
  
  -- Metadata
  user_agent      text default '',
  ip_address      text default '',
  
  created_at      timestamptz not null default now()
);

-- 6) Lead Activities (audit trail)
CREATE TABLE IF NOT EXISTS lead_activities (
  id          bigserial primary key,
  lead_id     bigint references leads(id) on delete cascade,
  activity_type text not null, -- created|updated|dispatched|failed|duplicate_detected
  description text not null,
  metadata    jsonb default '{}',
  user_id     text default 'system',
  created_at  timestamptz not null default now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_email_country ON leads(lower(email), country);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phonecc, phone) WHERE phone != '';
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_logs_lead_id ON integration_logs(lead_id);
CREATE INDEX IF NOT EXISTS idx_logs_integration_id ON integration_logs(integration_id);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON integration_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_integrations_active ON integrations(active);
CREATE INDEX IF NOT EXISTS idx_integrations_brand ON integrations(brand_id, active);
CREATE INDEX IF NOT EXISTS idx_activities_lead ON lead_activities(lead_id);

-- Sample seed data
INSERT INTO brands (id, name, description, active) VALUES
  (1000, 'Demo Trading Platform', 'Test integration for trading platform', true),
  (1001, 'Forex Broker Demo', 'Demo forex broker integration', true)
  ON CONFLICT (id) DO NOTHING;

INSERT INTO integrations (brand_id, name, api_url, method, auth_type, field_mapping, required_fields, active) VALUES
  (1000, 'Demo API Endpoint', 'https://httpbin.org/post', 'POST', 'none',
   '{"firstName":"first_name","lastName":"last_name","email":"email","phone":"phone","country":"country","source":"utm_source"}',
   '{first_name,email,country}', true),
  (1001, 'Secondary Demo', 'https://reqres.in/api/users', 'POST', 'none',
   '{"name":"first_name","email":"email","country":"country"}',
   '{first_name,email}', true)
  ON CONFLICT DO NOTHING;
