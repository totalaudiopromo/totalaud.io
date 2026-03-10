import { createAdminClient } from './config'

const supabase = createAdminClient()

async function checkAuthStatus() {
  const targetEmail = 'chrisschofield@libertymusicpr.com'

  console.log('Checking Supabase Auth Status...')

  // 1. Check if Email provider is enabled by trying to list users
  const { data, error } = await supabase.auth.admin.listUsers()

  if (error) {
    console.error('Error listing users (auth might be misconfigured/unresponsive):', error.message)
    return
  }

  console.log(`Successfully listed ${data.users.length} users.`)

  // 2. Search for the user
  const user = data.users.find((u) => u.email === targetEmail)

  if (user) {
    console.log(`\nUser FOUND: ${targetEmail}`)
    console.log(`ID: ${user.id}`)
    console.log(`Providers: ${user.app_metadata.providers.join(', ')}`)
    console.log(`Email confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`)
    console.log(`Last sign in: ${user.last_sign_in_at || 'Never'}`)
  } else {
    console.log(`\nUser NOT FOUND: ${targetEmail}`)
    console.log('Available user emails in the system:')
    data.users.forEach((u) => console.log(` - ${u.email}`))
  }

  // 3. Since we can't directly check if provider is enabled through the JS SDK,
  // the 400 error the user got is the best indicator.
}

checkAuthStatus()
