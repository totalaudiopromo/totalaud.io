import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  ANTHROPIC_API_KEY: z.string().min(1).optional(),
  TAP_API_URL: z.string().url().optional(),
  TAP_API_KEY: z.string().min(1).optional(),
})

const processEnv = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  TAP_API_URL: process.env.TAP_API_URL,
  TAP_API_KEY: process.env.TAP_API_KEY,
}

const parsed = envSchema.safeParse(processEnv)

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', JSON.stringify(parsed.error.format(), null, 2))
  throw new Error('Invalid environment variables')
}

export const env = parsed.data
