import { supabase } from '@/integrations/supabase/client'

const FUNCTION_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/reseller-proxy`

async function callProxy(body: Record<string, unknown>) {
  const { data: { session } } = await supabase.auth.getSession()
  const res = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
    },
    body: JSON.stringify(body),
  })
  return res.json()
}

export async function createOrder(credits: number) {
  return callProxy({ action: 'create_order', credits })
}

export async function checkStatus(orderId: number) {
  if (!orderId || isNaN(orderId)) return { ok: false, error: 'order_id inválido' }
  return callProxy({ action: 'check_status', order_id: orderId })
}

export async function getEvents(orderId: number) {
  if (!orderId || isNaN(orderId)) return { ok: false, events: [], error: 'order_id inválido' }
  return callProxy({ action: 'get_events', order_id: orderId })
}

export async function listOrders(limit = 50) {
  return callProxy({ action: 'list_orders', limit })
}

export async function getBalance() {
  return callProxy({ action: 'get_balance' })
}

// Price calculation with linear interpolation
export function calculateCreditPrice(credits: number): number {
  const tiers = [
    { min: 10, max: 100, rateStart: 0.05, rateEnd: 0.05 },
    { min: 101, max: 1000, rateStart: 0.05, rateEnd: 0.03752 },
    { min: 1001, max: 5000, rateStart: 0.03752, rateEnd: 0.032158 },
    { min: 5001, max: 10000, rateStart: 0.032158, rateEnd: 0.030015 },
  ]

  for (const tier of tiers) {
    if (credits >= tier.min && credits <= tier.max) {
      const t = (credits - tier.min) / (tier.max - tier.min)
      const rate = tier.rateStart + t * (tier.rateEnd - tier.rateStart)
      return credits * rate
    }
  }
  return credits * 0.030015
}
