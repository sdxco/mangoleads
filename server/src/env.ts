import 'dotenv/config';

function must(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

export const env = {
  PORT: Number(process.env.PORT || 8080),
  SUPABASE_URL: must('SUPABASE_URL'),
  SUPABASE_SERVICE_KEY: must('SUPABASE_SERVICE_KEY'),
  INTAKE_API_KEY: must('INTAKE_API_KEY'),
  ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS || '').split(',').map((s: string) => s.trim()).filter(Boolean),
};
