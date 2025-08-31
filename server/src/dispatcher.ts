import axios from 'axios';
import { sb } from './supabase.js';

export async function getActiveIntegrationsForCountry(country?: string) {
  const { data: rows, error } = await sb
    .from('integrations')
    .select('*, brand:brands(name,active)')
    .eq('active', true);
  if (error) throw error;
  // If you add dispatch_rules by country, filter here (left simple for now)
  return rows || [];
}

function buildPayload(field_mapping: Record<string,string>, lead: any) {
  // Map external field names -> internal lead fields
  const payload: Record<string, any> = {};
  for (const [ext, internal] of Object.entries(field_mapping || {})) {
    payload[ext] = lead[internal];
  }
  // include originals if not mapped
  return { ...lead, ...payload };
}

function buildHeaders(integ: any) {
  const headers: Record<string,string> = { 'Content-Type': 'application/json' };
  if (integ.auth_type === 'bearer' && integ.auth_value) headers['Authorization'] = `Bearer ${integ.auth_value}`;
  if (integ.auth_type === 'basic' && integ.auth_value) headers['Authorization'] = `Basic ${integ.auth_value}`;
  if (integ.auth_type === 'apiKeyHeader' && integ.api_key_header && integ.auth_value) headers[integ.api_key_header] = integ.auth_value;
  return headers;
}

export async function sendLeadToIntegration(lead: any, integ: any) {
  const started = Date.now();
  try {
    // validate required fields
    const req = (integ.required_fields || []) as string[];
    for (const f of req) if (!lead[f]) throw new Error(`Missing required field: ${f}`);

    const headers = buildHeaders(integ);
    const payload = buildPayload(integ.field_mapping || {}, lead);

    const res = await axios({
      url: integ.api_url,
      method: (integ.method || 'POST').toUpperCase() as any,
      timeout: integ.timeout_ms || 10000,
      headers,
      data: payload,
      params: (integ.method || 'POST').toUpperCase() === 'GET' ? payload : undefined,
    });

    await sb.from('integration_logs').insert({
      lead_id: lead.id,
      integration_id: integ.id,
      status: 'sent',
      http_code: res.status,
      duration_ms: Date.now() - started,
      response_body: typeof res.data === 'string' ? res.data : JSON.stringify(res.data).slice(0, 5000),
    });

    return { ok: true };
  } catch (e: any) {
    await sb.from('integration_logs').insert({
      lead_id: lead.id,
      integration_id: integ.id,
      status: 'failed',
      http_code: e.response?.status || null,
      duration_ms: Date.now() - started,
      response_body: e.response?.data ? JSON.stringify(e.response.data).slice(0,5000) : String(e.message).slice(0,5000),
    });
    return { ok: false, error: e.message };
  }
}

export async function dispatchLead(leadId: number) {
  const { data: lead, error } = await sb.from('leads').select('*').eq('id', leadId).single();
  if (error || !lead) throw error || new Error('Lead not found');

  const integrations = await getActiveIntegrationsForCountry(lead.country);
  let successes = 0, failures = 0;
  for (const integ of integrations) {
    const r = await sendLeadToIntegration(lead, integ);
    r.ok ? successes++ : failures++;
  }

  const status = failures === 0 && successes > 0 ? 'sent' : (successes === 0 ? 'failed' : 'sent');
  await sb.from('leads').update({ status, updated_at: new Date().toISOString() }).eq('id', lead.id);
  return { successes, failures };
}

export async function retryQueuedLeads(limit = 50) {
  const { data: rows, error } = await sb
    .from('leads')
    .select('id')
    .eq('status', 'queued')
    .order('created_at', { ascending: true })
    .limit(limit);
  if (error) throw error;
  for (const r of rows || []) await dispatchLead(r.id);
}
