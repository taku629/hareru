'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import PageLoader from '@/components/PageLoader'
import { createClient } from '@/lib/supabase/client'
import { getTotalHarePoints, getToday } from '@/lib/storage'
import { getProfile } from '@/lib/profile'

interface DayStat {
  date: string
  harePoints: number
  hasMorning: boolean
  moyamoyaCount: number
  hasYokatta: boolean
}

interface Stats {
  totalPoints: number
  streak: number
  totalDays: number
  totalMoyamoya: number
  totalYokatta: number
  recentDays: DayStat[]
}

function calcStreak(days: DayStat[]): number {
  if (days.length === 0) return 0
  const sorted = [...days].sort((a, b) => b.date.localeCompare(a.date))
  const today = getToday()
  let streak = 0
  let expected = today

  for (const day of sorted) {
    if (day.date === expected && (day.hasMorning || day.moyamoyaCount > 0 || day.hasYokatta)) {
      streak++
      // 前日へ
      const d = new Date(expected)
      d.setDate(d.getDate() - 1)
      expected = d.toISOString().slice(0, 10)
    } else if (day.date < expected) {
      break
    }
  }
  return streak
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [displayName, setDisplayName] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [
        { data: records },
        { data: moyamoyaRows },
        { data: yokattaRows },
        totalPoints,
        profile,
      ] = await Promise.all([
        supabase.from('daily_records').select('id,date,morning_message,hare_points').eq('user_id', user.id).order('date', { ascending: false }),
        supabase.from('moyamoya_entries').select('daily_record_id').eq('user_id', user.id),
        supabase.from('yokatta_entries').select('daily_record_id').eq('user_id', user.id),
        getTotalHarePoints(),
        getProfile(),
      ])
      setDisplayName(profile?.display_name ?? null)
      setAvatarUrl(profile?.avatar_url ?? null)

      const days: DayStat[] = (records ?? []).map(r => ({
        date: r.date as string,
        harePoints: r.hare_points ?? 0,
        hasMorning: !!r.morning_message,
        moyamoyaCount: (moyamoyaRows ?? []).filter(m => m.daily_record_id === r.id).length,
        hasYokatta: (yokattaRows ?? []).some(y => y.daily_record_id === r.id),
      }))

      setStats({
        totalPoints,
        streak: calcStreak(days),
        totalDays: days.length,
        totalMoyamoya: (moyamoyaRows ?? []).length,
        totalYokatta: (yokattaRows ?? []).length,
        recentDays: days.slice(0, 30),
      })
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <PageLoader />

  const s = stats!

  const SHARE_MILESTONES = [7, 30, 100]
  const milestone = SHARE_MILESTONES.find(m => s.streak >= m && s.streak < (SHARE_MILESTONES[SHARE_MILESTONES.indexOf(m) + 1] ?? Infinity))
    ?? (s.streak >= 100 ? 100 : null)

  function handleShare(days: number) {
    const cardUrl = `${location.origin}/api/share-card?days=${days}&name=${encodeURIComponent(displayName ?? 'あなた')}`
    const tweetText = encodeURIComponent(`${days}日間晴れ続けました☀️ #Hareru`)
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}&url=${encodeURIComponent(cardUrl)}`, '_blank')
  }

  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{ background: 'linear-gradient(160deg,#fef9f0 0%,#fff0f5 50%,#f0f4ff 100%)' }}
    >
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <Header harePoints={s.totalPoints} displayName={displayName} avatarUrl={avatarUrl} />

      <main
        className="relative z-10 max-w-lg mx-auto px-4"
        style={{
          paddingTop: 'calc(var(--safe-top) + 68px)',
          paddingBottom: 'calc(var(--nav-h) + var(--safe-bottom) + 16px)',
          minHeight: '100dvh',
        }}
      >
        {/* タイトル */}
        <div
          className="text-center mb-6 animate-fade-up"
          style={{ animationDelay: '0.05s', opacity: 0, animationFillMode: 'forwards' }}
        >
          <p style={{ fontSize: 48, marginBottom: 8, animation: 'float 5s ease-in-out infinite', lineHeight: 1 }}>📊</p>
          <h1
            className="font-black mb-1"
            style={{
              fontFamily: "'M PLUS Rounded 1c', sans-serif",
              fontSize: 'clamp(20px, 6vw, 26px)',
              background: 'linear-gradient(135deg,#fb923c,#f472b6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            あなたの晴れ記録
          </h1>
          <p style={{ color: '#a87c60', fontSize: 13 }}>積み重ねが見える ✨</p>
        </div>

        {/* ストリーク & ポイント */}
        <div
          className="grid grid-cols-2 gap-3 mb-4 animate-fade-up"
          style={{ animationDelay: '0.12s', opacity: 0, animationFillMode: 'forwards' }}
        >
          {/* ストリーク */}
          <div
            className="rounded-3xl p-4 text-center"
            style={{
              background: 'rgba(255,255,255,0.82)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(251,146,60,0.22)',
              boxShadow: '0 8px 28px rgba(251,146,60,0.1)',
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 4, animation: 'float 5s ease-in-out infinite' }}>🔥</div>
            <div
              style={{
                fontFamily: "'M PLUS Rounded 1c', sans-serif",
                fontWeight: 900,
                fontSize: 32,
                background: 'linear-gradient(135deg,#fb923c,#f472b6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                lineHeight: 1,
                marginBottom: 4,
              }}
            >
              {s.streak}
            </div>
            <div style={{ fontSize: 12, color: '#a87c60', fontWeight: 700 }}>日連続</div>
          </div>

          {/* 累計ポイント */}
          <div
            className="rounded-3xl p-4 text-center"
            style={{
              background: 'rgba(255,255,255,0.82)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(129,140,248,0.22)',
              boxShadow: '0 8px 28px rgba(129,140,248,0.1)',
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 4, animation: 'float 6s ease-in-out infinite 0.5s' }}>✨</div>
            <div
              style={{
                fontFamily: "'M PLUS Rounded 1c', sans-serif",
                fontWeight: 900,
                fontSize: 32,
                background: 'linear-gradient(135deg,#818cf8,#c084fc)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                lineHeight: 1,
                marginBottom: 4,
              }}
            >
              {s.totalPoints}
            </div>
            <div style={{ fontSize: 12, color: '#6860b5', fontWeight: 700 }}>累計pt</div>
          </div>
        </div>

        {/* ストリーク達成シェアバナー */}
        {milestone && (
          <div
            className="rounded-3xl p-4 mb-4 animate-fade-up"
            style={{
              animationDelay: '0.16s', opacity: 0, animationFillMode: 'forwards',
              background: 'linear-gradient(135deg,rgba(251,146,60,0.12),rgba(244,114,182,0.12))',
              border: '1px solid rgba(251,146,60,0.3)',
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p style={{ fontFamily: "'M PLUS Rounded 1c', sans-serif", fontWeight: 900, fontSize: 14, color: '#c2410c', marginBottom: 2 }}>
                  🎉 {milestone}日連続達成！
                </p>
                <p style={{ fontSize: 12, color: '#a87c60' }}>みんなにシェアしよう</p>
              </div>
              <button
                onClick={() => handleShare(milestone)}
                style={{
                  background: 'linear-gradient(135deg,#fb923c,#f472b6)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 16,
                  padding: '10px 18px',
                  fontFamily: "'M PLUS Rounded 1c', sans-serif",
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                𝕏 シェア
              </button>
            </div>
          </div>
        )}

        {/* アクティビティ数 */}
        <div
          className="rounded-3xl p-4 mb-4 animate-fade-up"
          style={{
            animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards',
            background: 'rgba(255,255,255,0.78)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(251,146,60,0.18)',
          }}
        >
          <p style={{ fontFamily: "'M PLUS Rounded 1c', sans-serif", fontWeight: 700, fontSize: 13, color: '#c2410c', marginBottom: 14 }}>
            📈 アクティビティ
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: '記録した日', value: s.totalDays, emoji: '📅', color: '#ea580c' },
              { label: 'モヤモヤ', value: s.totalMoyamoya, emoji: '🌤', color: '#4338ca' },
              { label: '夜の記録', value: s.totalYokatta, emoji: '🌙', color: '#16a34a' },
            ].map(item => (
              <div key={item.label} className="text-center">
                <div style={{ fontSize: 22, marginBottom: 4 }}>{item.emoji}</div>
                <div style={{ fontFamily: "'M PLUS Rounded 1c', sans-serif", fontWeight: 900, fontSize: 22, color: item.color, lineHeight: 1, marginBottom: 2 }}>{item.value}</div>
                <div style={{ fontSize: 11, color: '#a87c60' }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 直近30日カレンダー */}
        <div
          className="rounded-3xl p-4 mb-4 animate-fade-up"
          style={{
            animationDelay: '0.28s', opacity: 0, animationFillMode: 'forwards',
            background: 'rgba(255,255,255,0.78)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(251,146,60,0.18)',
          }}
        >
          <p style={{ fontFamily: "'M PLUS Rounded 1c', sans-serif", fontWeight: 700, fontSize: 13, color: '#c2410c', marginBottom: 14 }}>
            📅 直近の記録（新しい順）
          </p>
          {s.recentDays.length === 0 ? (
            <p style={{ color: '#c9a88e', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>
              まだ記録がないよ。今日から始めよう！☀️
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {s.recentDays.map(day => (
                <div
                  key={day.date}
                  className="flex items-center justify-between rounded-2xl px-3 py-2.5"
                  style={{
                    background: day.harePoints > 0
                      ? 'linear-gradient(135deg,rgba(251,146,60,0.06),rgba(244,114,182,0.06))'
                      : 'rgba(0,0,0,0.02)',
                    border: day.harePoints > 0
                      ? '1px solid rgba(251,146,60,0.18)'
                      : '1px solid rgba(0,0,0,0.05)',
                  }}
                >
                  <span style={{ fontSize: 12, color: '#a87c60', fontWeight: 700, fontFamily: "'M PLUS Rounded 1c', sans-serif" }}>
                    {day.date.slice(5).replace('-', '/')}
                  </span>
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: 15, opacity: day.hasMorning ? 1 : 0.2 }}>☀️</span>
                    <span style={{ fontSize: 15, opacity: day.moyamoyaCount > 0 ? 1 : 0.2 }}>🌤</span>
                    <span style={{ fontSize: 15, opacity: day.hasYokatta ? 1 : 0.2 }}>🌙</span>
                    {day.harePoints > 0 && (
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#ea580c', fontFamily: "'M PLUS Rounded 1c', sans-serif", marginLeft: 4 }}>
                        +{day.harePoints}pt
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 称号 */}
        <div
          className="rounded-3xl p-4 mb-4 animate-fade-up text-center"
          style={{
            animationDelay: '0.36s', opacity: 0, animationFillMode: 'forwards',
            background: 'rgba(255,255,255,0.78)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(251,146,60,0.18)',
          }}
        >
          {(() => {
            const p = s.totalPoints
            const [title, emoji, desc] =
              p >= 500 ? ['晴れマスター', '🌈', '500pt達成！圧倒的な晴れパワー！'] :
              p >= 200 ? ['晴れ上手', '☀️', '200pt超え！すっかり晴れ体質だね'] :
              p >= 100 ? ['晴れ見習い', '🌤', '100pt超え！調子が出てきた！'] :
              p >= 30  ? ['晴れのたまご', '🥚', 'はれる生活、スタート！'] :
                         ['晴れ予報', '🌥', '最初の一歩、記録してみよう！']
            return (
              <>
                <div style={{ fontSize: 40, marginBottom: 8, animation: 'sparkle 2s ease-in-out infinite' }}>{emoji}</div>
                <div style={{ fontFamily: "'M PLUS Rounded 1c', sans-serif", fontWeight: 900, fontSize: 20, color: '#c2410c', marginBottom: 4 }}>{title}</div>
                <div style={{ fontSize: 12, color: '#a87c60' }}>{desc}</div>
              </>
            )
          })()}
        </div>
      </main>
    </div>
  )
}
