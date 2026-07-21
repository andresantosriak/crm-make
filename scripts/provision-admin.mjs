import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

function loadEnv() {
  const envFiles = ['.env.local', '.env']
  const vars = {}
  for (const file of envFiles) {
    try {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8')
      for (const line of content.split('\n')) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) continue
        const eqIdx = trimmed.indexOf('=')
        if (eqIdx === -1) continue
        const key = trimmed.slice(0, eqIdx).trim()
        const val = trimmed.slice(eqIdx + 1).trim()
        if (!vars[key]) vars[key] = val
      }
    } catch {}
  }
  return vars
}

const env = loadEnv()

const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL
const supabaseServiceKey = env.SUPABASE_SECRET_KEY
const adminEmail = env.ADMIN_EMAIL
const adminPassword = env.ADMIN_INITIAL_PASSWORD

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Faltam SUPABASE_URL e SUPABASE_SECRET_KEY no .env / .env.local')
  process.exit(1)
}

if (!adminEmail || !adminPassword) {
  console.error('Faltam ADMIN_EMAIL e ADMIN_INITIAL_PASSWORD no .env / .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

console.log(`Provisionando admin: ${adminEmail}`)

const { data: existingUsers } = await supabase.auth.admin.listUsers()
const existing = existingUsers?.users?.find(u => u.email === adminEmail)

if (existing) {
  console.log(`Usuário já existe (id: ${existing.id}). Verificando profile...`)

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', existing.id)
    .single()

  if (profileError || !profile) {
    console.log('Profile não encontrado. Criando...')
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({ id: existing.id, full_name: 'André', role: 'admin' })

    if (insertError) {
      console.error('Erro ao criar profile:', insertError.message)
      process.exit(1)
    }
    console.log('Profile criado com role admin.')
  } else if (profile.role !== 'admin') {
    console.log(`Profile existe com role "${profile.role}". Atualizando para admin...`)
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', existing.id)

    if (updateError) {
      console.error('Erro ao atualizar role:', updateError.message)
      process.exit(1)
    }
    console.log('Role atualizado para admin.')
  } else {
    console.log('Profile já está com role admin. Nada a fazer.')
  }
} else {
  const { data, error } = await supabase.auth.admin.createUser({
    email: adminEmail,
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

  console.log(`Admin criado com sucesso (id: ${data.user.id})`)
  console.log('Trigger handle_new_user criou o profile automaticamente.')
}

const { data: finalProfile } = await supabase
  .from('profiles')
  .select('id, full_name, role')
  .eq('id', existing?.id || '')
  .single()

if (finalProfile) {
  console.log(`\nVerificação final:`)
  console.log(`  id: ${finalProfile.id}`)
  console.log(`  full_name: ${finalProfile.full_name}`)
  console.log(`  role: ${finalProfile.role}`)
}

console.log('\nDone.')
