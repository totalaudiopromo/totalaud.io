import { createAdminClient } from './config'
import crypto from 'crypto'

const supabase = createAdminClient()

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
    // Use password from env or generate a cryptographically-secure random password
    const password =
      process.env.SUPABASE_NEW_USER_PASSWORD || crypto.randomBytes(16).toString('hex')
    console.log(`User not found, creating ${email}...`)
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
