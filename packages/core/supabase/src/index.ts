import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function getUserId(request: Request): Promise<string> {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader) throw new Error('No authorization header')

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error } = await supabase.auth.getUser(token)
  
  if (error || !user) throw new Error('Unauthorized')
  return user.id
}

export * from '@supabase/supabase-js'

