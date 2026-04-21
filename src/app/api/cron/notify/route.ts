import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'
import { createClient } from '@/lib/supabase/server'

// UTC 23:00 = JST 08:00 (朝リマインダー)
// UTC 12:00 = JST 21:00 (夜リマインダー)
function getNotificationContent(utcHour: number) {
  if (utcHour === 23) {
    return { title: 'はれる ☀️', body: '今日の晴れメッセージが届いています☀️' }
  }
  return { title: 'はれる 🌙', body: '今日のよかったことを記録しよう🌙' }
}

export async function GET(req: NextRequest) {
  // Vercel Cron auth
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  webpush.setVapidDetails(
    process.env.VAPID_MAILTO ?? 'mailto:example@example.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? '',
    process.env.VAPID_PRIVATE_KEY ?? ''
  )

  const supabase = await createClient()
  const { data: rows } = await supabase.from('push_subscriptions').select('subscription')
  if (!rows?.length) return NextResponse.json({ sent: 0 })

  const utcHour = new Date().getUTCHours()
  const { title, body } = getNotificationContent(utcHour)

  const results = await Promise.allSettled(
    rows.map(row =>
      webpush.sendNotification(row.subscription as webpush.PushSubscription, JSON.stringify({ title, body }))
    )
  )

  const sent = results.filter(r => r.status === 'fulfilled').length
  return NextResponse.json({ sent, total: rows.length })
}
