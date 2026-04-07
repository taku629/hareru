import { createClient } from '@/lib/supabase/client'

export interface DailyRecord {
  date: string // YYYY-MM-DD
  moyamoya: MoyamoyaEntry[]
  yokatta: YokattaEntry[]
  morningMessage?: string
  harePoints: number
  // DB の daily_records.id（内部で使用）
  _dbId?: string
}

export interface MoyamoyaEntry {
  id: string
  text: string
  reframe: string
  createdAt: string
}

export interface YokattaEntry {
  id: string
  items: string[]
  story: string
  createdAt: string
}

export function getToday(): string {
  return new Date().toLocaleDateString('ja-JP', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).replace(/\//g, '-')
}

// UUID パターン（DB 発行のID）
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function getTodayRecord(): Promise<DailyRecord> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { date: getToday(), moyamoya: [], yokatta: [], harePoints: 0 }

  const today = getToday()

  // 今日のレコードを取得（なければ upsert で作成）
  const { data: record, error } = await supabase
    .from('daily_records')
    .upsert(
      { user_id: user.id, date: today, hare_points: 0 },
      { onConflict: 'user_id,date', ignoreDuplicates: true }
    )
    .select()
    .single()

  let dbRecord = record
  if (error || !dbRecord) {
    // upsert で既存行が返らない場合は select で取得
    const { data } = await supabase
      .from('daily_records')
      .select()
      .eq('user_id', user.id)
      .eq('date', today)
      .single()
    dbRecord = data
  }

  if (!dbRecord) return { date: today, moyamoya: [], yokatta: [], harePoints: 0 }

  // 関連エントリーを取得
  const [{ data: moyamoyaRows }, { data: yokattaRows }] = await Promise.all([
    supabase
      .from('moyamoya_entries')
      .select()
      .eq('daily_record_id', dbRecord.id)
      .order('created_at', { ascending: true }),
    supabase
      .from('yokatta_entries')
      .select()
      .eq('daily_record_id', dbRecord.id)
      .order('created_at', { ascending: true }),
  ])

  return {
    date: today,
    morningMessage: dbRecord.morning_message ?? undefined,
    harePoints: dbRecord.hare_points ?? 0,
    _dbId: dbRecord.id,
    moyamoya: (moyamoyaRows ?? []).map(r => ({
      id: r.id,
      text: r.text,
      reframe: r.reframe,
      createdAt: r.created_at,
    })),
    yokatta: (yokattaRows ?? []).map(r => ({
      id: r.id,
      items: r.items,
      story: r.story,
      createdAt: r.created_at,
    })),
  }
}

export async function saveTodayRecord(record: DailyRecord): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const today = getToday()

  // daily_record を upsert して id を取得
  const { data: dbRecord } = await supabase
    .from('daily_records')
    .upsert(
      {
        user_id: user.id,
        date: today,
        morning_message: record.morningMessage ?? null,
        hare_points: record.harePoints,
      },
      { onConflict: 'user_id,date' }
    )
    .select()
    .single()

  const dailyRecordId = dbRecord?.id ?? record._dbId
  if (!dailyRecordId) return

  // クライアント生成のID（Date.now()系）を持つ新規エントリーを DB に保存
  const newMoyamoya = record.moyamoya.filter(e => !UUID_RE.test(e.id))
  const newYokatta = record.yokatta.filter(e => !UUID_RE.test(e.id))

  if (newMoyamoya.length > 0) {
    await supabase.from('moyamoya_entries').insert(
      newMoyamoya.map(e => ({
        user_id: user.id,
        daily_record_id: dailyRecordId,
        text: e.text,
        reframe: e.reframe,
      }))
    )
  }

  if (newYokatta.length > 0) {
    await supabase.from('yokatta_entries').insert(
      newYokatta.map(e => ({
        user_id: user.id,
        daily_record_id: dailyRecordId,
        items: e.items,
        story: e.story,
      }))
    )
  }
}

export async function getTotalHarePoints(): Promise<number> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 0

  const { data } = await supabase
    .from('daily_records')
    .select('hare_points')
    .eq('user_id', user.id)

  return (data ?? []).reduce((sum, r) => sum + (r.hare_points ?? 0), 0)
}

export async function getRecentContext(): Promise<string> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return ''

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const from = sevenDaysAgo.toISOString().slice(0, 10)

  const { data: records } = await supabase
    .from('daily_records')
    .select('id, date, morning_message')
    .eq('user_id', user.id)
    .gte('date', from)
    .order('date', { ascending: true })

  if (!records || records.length === 0) return ''

  const recordIds = records.map(r => r.id)
  const [{ data: moyamoyaRows }, { data: yokattaRows }] = await Promise.all([
    supabase
      .from('moyamoya_entries')
      .select('daily_record_id, text')
      .in('daily_record_id', recordIds),
    supabase
      .from('yokatta_entries')
      .select('daily_record_id, items')
      .in('daily_record_id', recordIds),
  ])

  const lines: string[] = []
  for (const r of records) {
    if (r.morning_message) lines.push(`[${r.date}] 朝のメッセージ: ${r.morning_message}`)
    ;(moyamoyaRows ?? [])
      .filter(m => m.daily_record_id === r.id)
      .forEach(m => lines.push(`[${r.date}] モヤモヤ: ${m.text}`))
    ;(yokattaRows ?? [])
      .filter(y => y.daily_record_id === r.id)
      .forEach(y => lines.push(`[${r.date}] 良かったこと: ${(y.items as string[]).join('、')}`))
  }
  return lines.join('\n')
}
