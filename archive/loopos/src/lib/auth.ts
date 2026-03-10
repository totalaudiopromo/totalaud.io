import { supabase } from '@total-audio/loopos-db'
import { z } from 'zod'

const emailSchema = z.string().email()

export const auth = {
  async sendMagicLink(email: string, redirectTo?: string): Promise<{ error: Error | null }> {
    const validEmail = emailSchema.safeParse(email)
    if (!validEmail.success) {
      return { error: new Error('Invalid email address') }
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo || `${window.location.origin}/auth/callback`,
      },
    })

    return { error }
  },

  async signOut(): Promise<{ error: Error | null }> {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession()
    if (error) return { session: null, error }
    return { session: data.session, error: null }
  },

  async getUser() {
    const { data, error } = await supabase.auth.getUser()
    if (error) return { user: null, error }
    return { user: data.user, error: null }
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  },
}
