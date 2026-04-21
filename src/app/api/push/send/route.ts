import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  webpush.setVapidDetails(
    process.env.VAPID_MAILTO ?? 'mailto:example@example.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? '',
    process.env.VAPID_PRIVATE_KEY ?? ''
  )
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, body } = await req.json()

  const { data: rows } = await supabase
    .from('push_subscriptions')
    .select('subscription')
    .eq('user_id', user.id)

  if (!rows?.length) return NextResponse.json({ sent: 0 })

  const results = await Promise.allSettled(
    rows.map(row =>
      webpush.sendNotification(row.subscription as webpush.PushSubscription, JSON.stringify({ title, body }))
    )
  )

  const sent = results.filter(r => r.status === 'fulfilled').length
  return NextResponse.json({ sent })
}
