-- Run with: psql -U postgres -d leads -f schema.sql
-- MangoLeads CRM Database Schema

-- Enable citext extension for case-insensitive text
CREATE EXTENSION IF NOT EXISTS citext;

-- Main leads table
CREATE TABLE IF NOT EXISTS leads (
  id            BIGSERIAL PRIMARY KEY,
  first_name    VARCHAR(50) NOT NULL,
  last_name     VARCHAR(50) NOT NULL,
  email         CITEXT      NOT NULL,
  phonecc       VARCHAR(5)  NOT NULL,
  phone         VARCHAR(14) NOT NULL,
  country       CHAR(2)     NOT NULL,
  age           SMALLINT,
  referer       TEXT,
  user_ip       INET        NOT NULL,
  brand_id      VARCHAR(50) NOT NULL,
  brand_name    VARCHAR(100) NOT NULL,
  tracker_url   TEXT        NOT NULL,
  aff_id        VARCHAR(20) NOT NULL,
  offer_id      VARCHAR(10) NOT NULL,
  aff_sub       TEXT,
  aff_sub2      TEXT,
  aff_sub3      TEXT,
  aff_sub4      TEXT,
  aff_sub5      TEXT,
  orig_offer    TEXT,
  status        TEXT CHECK (status IN ('queued','sent','error')) DEFAULT 'queued',
  attempts      SMALLINT DEFAULT 0,
  last_error    TEXT,
  sent_at       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Create unique index on email to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS leads_email_idx ON leads (email);

-- Additional indexes for performance
CREATE INDEX IF NOT EXISTS leads_status_idx ON leads (status);
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads (created_at);
CREATE INDEX IF NOT EXISTS leads_aff_id_idx ON leads (aff_id);
CREATE INDEX IF NOT EXISTS leads_offer_id_idx ON leads (offer_id);
CREATE INDEX IF NOT EXISTS leads_brand_id_idx ON leads (brand_id);
CREATE INDEX IF NOT EXISTS leads_brand_status_idx ON leads (brand_id, status);

-- Comment the table for documentation
COMMENT ON TABLE leads IS 'Main table for storing lead information in MangoLeads CRM with multi-brand support';
COMMENT ON COLUMN leads.brand_id IS 'Brand identifier from brands-config.js';
COMMENT ON COLUMN leads.brand_name IS 'Human-readable brand name for reporting';
COMMENT ON COLUMN leads.tracker_url IS 'Brand-specific tracker URL for lead submission';
COMMENT ON COLUMN leads.status IS 'Lead processing status: queued (new), sent (successfully sent), error (failed to send)';
COMMENT ON COLUMN leads.attempts IS 'Number of times we attempted to send this lead';
COMMENT ON COLUMN leads.last_error IS 'Last error message if status is error';
COMMENT ON COLUMN leads.sent_at IS 'Timestamp when lead was successfully sent to brand';
