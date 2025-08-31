import { Router, Request, Response } from 'express';
import { LeadInSchema } from './types.js';
import { sb } from './supabase.js';
import { dispatchLead } from './dispatcher.js';
import { env } from './env.js';

function requireApiKey(req: Request, res: Response, next: any) {
  const key = req.header('x-api-key');
  if (!key || key !== env.INTAKE_API_KEY) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

export const router = Router();

// health
router.get('/health', (_req: Request, res: Response) => res.json({ ok: true }));

// 1) Public intake endpoint (landing pages submit here)
router.post('/leads/intake', requireApiKey, async (req: Request, res: Response) => {
  const parse = LeadInSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });

  const leadIn = parse.data;
  const { data, error } = await sb.from('leads').insert({ ...leadIn, status: 'queued' }).select('id').single();
  if (error) return res.status(500).json({ error: error.message });

  // fire and forget dispatch; you can await if you prefer
  dispatchLead(data!.id).catch(() => {});

  return res.status(201).json({ id: data!.id });
});

// 2) Admin: re-dispatch a lead (UI "Send" button)
router.post('/leads/:id/dispatch', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: 'Bad id' });
  const result = await dispatchLead(id);
  res.json(result);
});

// 3) Admin: list logs for a lead (UI expandable row)
router.get('/leads/:id/logs', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { data, error } = await sb
    .from('integration_logs')
    .select('*')
    .eq('lead_id', id)
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ logs: data });
});
