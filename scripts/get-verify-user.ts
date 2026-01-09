import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ucncbighzqudaszewjrv.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function getOrCreateUser() {
  const email = 'verify@totalaud.io'

  // Try to find the user
  const { data: users, error: listError } = await supabase.auth.admin.listUsers()

  if (listError) {
    console.error('Error listing users:', listError)
    process.exit(1)
  }

  let user = users.users.find((u) => u.email === email)

  if (!user) {
    // Use password from env or generate a random one (not committed)
    const password = process.env.VERIFY_USER_PASSWORD || Math.random().toString(36).slice(-12)
    console.log('User not found, creating verify@totalaud.io...')
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (createError) {
      console.error('Error creating user:', createError)
      process.exit(1)
    }
    user = newUser.user
  }

  console.log(`User ID for ${email}: ${user.id}`)
}

getOrCreateUser()
