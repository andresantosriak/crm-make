import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SECRET_KEY env vars')
  process.exit(1)
}

const adminPassword = process.env.ADMIN_INITIAL_PASSWORD
if (!adminPassword) {
  console.error('Missing ADMIN_INITIAL_PASSWORD env var')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const { data, error } = await supabase.auth.admin.createUser({
  email: 'andresantos.riak@gmail.com',
  password: adminPassword,
  email_confirm: true,
  user_metadata: {
    full_name: 'André',
    role: 'admin',
  },
})

if (error) {
  console.error('Erro ao criar admin:', error.message)
  process.exit(1)
}

console.log('Admin criado:', data.user.id)
