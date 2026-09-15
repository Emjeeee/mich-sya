// Deploy: supabase functions deploy send-expo-push
//
// Proxies a data-only Expo push to the caller's partner. Exists purely
// because the browser can't call https://exp.host/--/api/v2/push/send
// directly — it rejects cross-origin requests outright (confirmed: even a
// plain GET fails CORS in this project, not just the JSON POST's preflight),
// unlike the mobile app's native fetch() which isn't subject to CORS at all.
//
// The `to` token is deliberately NOT accepted from the client. It's
// resolved server-side from device_push_tokens, scoped to the caller's own
// couple via the same RLS policy the client already relies on
// (couple_id = my_couple_id()) — so a caller can only ever reach their own
// linked partner's device, never an arbitrary Expo token someone hands this
// function.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, apikey, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'content-type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return json({ error: 'Missing Authorization header' }, 401)

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  })

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) return json({ error: 'Unauthorized' }, 401)

  let body: { data?: Record<string, unknown>; priority?: 'default' | 'high' }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }
  if (!body.data || typeof body.data !== 'object') return json({ error: 'Missing data payload' }, 400)

  const { data: coupleRow } = await supabase
    .from('couple')
    .select('id')
    .or(`partner1_id.eq.${userData.user.id},partner2_id.eq.${userData.user.id}`)
    .maybeSingle()
  if (!coupleRow) return json({ error: 'Not linked to a couple' }, 403)

  const { data: tokenRows } = await supabase
    .from('device_push_tokens')
    .select('user_id, expo_push_token')
    .eq('couple_id', coupleRow.id)

  const partnerToken = tokenRows?.find((r) => r.user_id !== userData.user.id)?.expo_push_token
  if (!partnerToken) return json({ error: 'Partner has no push token registered' }, 404)

  // Data-only, always — no title/body/sound/channelId. Those turn this into
  // a display notification on Expo's gateway, which a backgrounded/killed
  // Android app never routes to its handler (see push.ts on the mobile side).
  const expoRes = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ to: partnerToken, data: body.data, priority: body.priority ?? 'high' }),
  })

  const expoJson = await expoRes.json().catch(() => null)
  if (!expoRes.ok || expoJson?.data?.status === 'error') {
    return json({ error: 'Expo push rejected', details: expoJson }, 502)
  }

  return json({ ok: true })
})
