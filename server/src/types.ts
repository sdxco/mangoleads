import { z } from 'zod';

export const LeadInSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().optional().default(''),
  email: z.string().email(),
  phonecc: z.string().optional().default(''),
  phone: z.string().optional().default(''),
  country: z.string().min(2).max(2),
  user_ip: z.string().optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
});
export type LeadIn = z.infer<typeof LeadInSchema>;
