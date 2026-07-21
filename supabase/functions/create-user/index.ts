import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

const allowedOrigin = Deno.env.get("ALLOWED_ORIGIN") ?? "http://localhost:8080"

const corsHeaders = {
  "Access-Control-Allow-Origin": allowedOrigin,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Token de autenticação ausente" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      )
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!

    const callerClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const { data: { user: caller }, error: authError } = await callerClient.auth.getUser()
    if (authError || !caller) {
      return new Response(
        JSON.stringify({ error: "Não autenticado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      )
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey)

    const { data: callerProfile, error: profileError } = await adminClient
      .from("profiles")
      .select("role, establishment_id")
      .eq("id", caller.id)
      .single()

    if (profileError || !["super_admin", "admin"].includes(callerProfile?.role ?? "")) {
      return new Response(
        JSON.stringify({ error: "Apenas administradores podem criar usuários" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      )
    }

    const body = await req.json()
    const { email, full_name, role, password, establishment_id } = body as {
      email?: string
      full_name?: string
      role?: string
      password?: string
      establishment_id?: string | null
    }

    if (!email || !full_name || !role || !password) {
      return new Response(
        JSON.stringify({ error: "Campos obrigatórios: email, full_name, role, password" }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      )
    }

    if (password.length < 8) {
      return new Response(
        JSON.stringify({ error: "Senha deve ter no mínimo 8 caracteres" }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Email inválido" }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      )
    }

    if (!["admin", "employee"].includes(role)) {
      return new Response(
        JSON.stringify({ error: "Role deve ser 'admin' ou 'employee'" }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      )
    }

    let targetEstablishmentId = establishment_id ?? null

    if (callerProfile.role === "admin") {
      if (role !== "employee") {
        return new Response(
          JSON.stringify({ error: "Admin local só pode criar funcionários" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        )
      }
      targetEstablishmentId = callerProfile.establishment_id
    }

    if (!targetEstablishmentId) {
      return new Response(
        JSON.stringify({ error: "Estabelecimento obrigatório" }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      )
    }

    const { data: establishment, error: establishmentError } = await adminClient
      .from("establishments")
      .select("id, active")
      .eq("id", targetEstablishmentId)
      .single()

    if (establishmentError || !establishment?.active) {
      return new Response(
        JSON.stringify({ error: "Estabelecimento inválido ou inativo" }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      )
    }

    const { data, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name,
        role,
        establishment_id: targetEstablishmentId,
      },
    })

    if (createError) {
      console.error("Create user error:", createError.message)
      return new Response(
        JSON.stringify({ error: "Erro ao criar usuário" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      )
    }

    return new Response(
      JSON.stringify({
        user: {
          id: data.user.id,
          email: data.user.email,
          full_name,
          role,
          establishment_id: targetEstablishmentId,
        },
      }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    )
  } catch (_err) {
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    )
  }
})
