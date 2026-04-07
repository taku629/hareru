'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Confetti from '@/components/Confetti'
import { getTodayRecord, saveTodayRecord, getTotalHarePoints } from '@/lib/storage'
import PageLoader from '@/components/PageLoader'

type Phase = 'input' | 'loading' | 'done'

const PLACEHOLDERS = [
  '例：授業で先生に指名されてちゃんと答えられた ✨',
  '例：友達と美味しいランチ食べた 🍜',
  '例：課題を提出期限前に終わらせた 💪',
]

export default function YokattaPage() {
  const [phase, setPhase] = useState<Phase>('input')
  const [items, setItems] = useState(['', '', ''])
  const [story, setStory] = useState('')
  const [confetti, setConfetti] = useState(false)
  const [harePoints, setHarePoints] = useState(0)
  const [alreadyDone, setAlreadyDone] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [points, rec] = await Promise.all([getTotalHarePoints(), getTodayRecord()])
      setHarePoints(points)
      if (rec.yokatta.length > 0) {
        const last = rec.yokatta[rec.yokatta.length - 1]
        setItems([...last.items, '', ''].slice(0, 3))
        setStory(last.story)
        setPhase('done')
        setAlreadyDone(true)
      }
      setDataLoading(false)
    }
    load()
  }, [])

  const filledItems = items.filter(i => i.trim())

  async function handleSubmit() {
    if (filledItems.length === 0) return
    setPhase('loading')
    setStory('')
    try {
      const res = await fetch('/api/yokatta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: filledItems }),
      })
      if (!res.ok || !res.body) throw new Error()
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let full = ''
      setPhase('done')
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        full += decoder.decode(value)
        setStory(full)
      }
      const rec = await getTodayRecord()
      rec.yokatta.push({ id: Date.now().toString(), items: filledItems, story: full, createdAt: new Date().toISOString() })
      rec.harePoints = (rec.harePoints || 0) + 10
      await saveTodayRecord(rec)
      setHarePoints(await getTotalHarePoints())
      setConfetti(true)
      setTimeout(() => setConfetti(false), 3500)
    } catch {
      setStory('素敵な一日だったね！✨ 毎日こうやって良かったことを見つけてる姿勢が一番大事だよ 🌙 明日もきっと晴れる！')
      setPhase('done')
    }
  }

  function handleReset() {
    setPhase('input')
    setItems(['', '', ''])
    setStory('')
    setAlreadyDone(false)
  }

  if (dataLoading) return <PageLoader dark />

  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{ background: 'linear-gradient(160deg,#0f1824 0%,#1a1523 50%,#0d1f17 100%)' }}
    >
      {/* Night orbs */}
      {[
        { color:'#4ade80', top:-60, right:-50, size:220, delay:'0s' },
        { color:'#818cf8', bottom:-50, left:-50, size:200, delay:'1s' },
        { color:'#facc15', top:'40%', left:'20%', size:140, delay:'2s' },
      ].map((o, i) => (
        <div
          key={i}
          style={{
            position:'fixed', borderRadius:'50%', filter:'blur(60px)', opacity:.15,
            pointerEvents:'none', zIndex:0,
            width: o.size, height: o.size,
            background: `radial-gradient(circle,${o.color},transparent)`,
            top: o.top ?? 'auto', bottom: (o as any).bottom ?? 'auto',
            left: o.left ?? 'auto', right: (o as any).right ?? 'auto',
            animation:`float ${8+i*2}s ease-in-out infinite`,
            animationDelay: o.delay,
          }}
        />
      ))}

      {/* Stars */}
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          style={{
            position:'fixed', width: 2+Math.floor(i%3), height: 2+Math.floor(i%3),
            borderRadius:'50%', background:'white',
            top:`${(i*13)%55}%`, left:`${(i*17+7)%95}%`,
            opacity:.4+.4*(i%2), zIndex:0, pointerEvents:'none',
            animation:`pulse-slow ${2+i*.3}s ease-in-out infinite`,
            animationDelay:`${i*.2}s`,
          }}
        />
      ))}

      <Header harePoints={harePoints} dark />
      <Confetti active={confetti} />

      <main
        className="relative z-10 max-w-lg mx-auto px-4 scroll-area"
        style={{
          paddingTop: 'calc(var(--safe-top) + 68px)',
          paddingBottom: 'calc(var(--nav-h) + var(--safe-bottom) + 16px)',
          minHeight: '100dvh',
        }}
      >
        {/* Header */}
        <div
          className="text-center mb-5 animate-fade-up"
          style={{ animationDelay: '0.08s', opacity: 0, animationFillMode: 'forwards' }}
        >
          <p style={{ fontSize: 48, marginBottom: 8, animation: 'float 6s ease-in-out infinite', lineHeight: 1 }}>🌙</p>
          <h1
            className="font-black mb-1"
            style={{
              fontFamily: "'M PLUS Rounded 1c', sans-serif",
              fontSize: 'clamp(20px, 6vw, 26px)',
              background: 'linear-gradient(135deg,#4ade80,#38bdf8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            今日の良かったこと
          </h1>
          <p style={{ color: '#86a898', fontSize: 13 }}>小さなことでも全然OK！書くだけで気持ちが軽くなるよ 🌟</p>
        </div>

        {/* Input form */}
        {phase !== 'done' && (
          <div
            className="rounded-3xl p-4 mb-4 animate-fade-up"
            style={{
              animationDelay: '0.18s', opacity: 0, animationFillMode: 'forwards',
              background: 'rgba(20,28,35,.88)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(74,222,128,.2)',
              boxShadow: '0 10px 36px rgba(74,222,128,.07)',
            }}
          >
            <p style={{ fontSize: 13, fontWeight: 700, color: '#4ade80', marginBottom: 14 }}>
              ✏️ 3つ書いてみよう（1つからでもOK！）
            </p>

            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-3 mb-3">
                <span
                  style={{
                    flexShrink: 0, width: 30, height: 30,
                    borderRadius: '50%', display:'flex', alignItems:'center', justifyContent:'center',
                    fontFamily: "'M PLUS Rounded 1c', sans-serif", fontWeight: 900, fontSize: 13,
                    background: item.trim()
                      ? 'linear-gradient(135deg,#4ade80,#38bdf8)'
                      : 'rgba(74,222,128,.15)',
                    color: item.trim() ? '#0d1f17' : '#4ade80',
                    transition: 'all .25s',
                  }}
                >
                  {item.trim() ? '✓' : i + 1}
                </span>
                <input
                  type="text"
                  value={item}
                  onChange={e => {
                    const n = [...items]; n[i] = e.target.value; setItems(n)
                  }}
                  placeholder={PLACEHOLDERS[i]}
                  className="flex-1 rounded-xl px-3 py-2.5"
                  style={{
                    background: 'rgba(255,255,255,.06)',
                    border: `1.5px solid ${item.trim() ? 'rgba(74,222,128,.4)' : 'rgba(74,222,128,.15)'}`,
                    color: '#e8f5f0',
                    fontFamily: "'Zen Maru Gothic', sans-serif",
                    fontSize: 14,
                    outline: 'none',
                    minHeight: 44,
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && i < 2) {
                      const inputs = document.querySelectorAll<HTMLInputElement>('input[type=text]')
                      inputs[i + 1]?.focus()
                    }
                  }}
                />
              </div>
            ))}

            <button
              onClick={handleSubmit}
              disabled={filledItems.length === 0 || phase === 'loading'}
              className="w-full rounded-2xl font-black mt-2"
              style={{
                fontFamily: "'M PLUS Rounded 1c', sans-serif",
                fontSize: 15,
                padding: '14px 24px',
                background: filledItems.length > 0
                  ? 'linear-gradient(135deg,#4ade80,#38bdf8)'
                  : 'rgba(74,222,128,.15)',
                color: filledItems.length > 0 ? '#0d1f17' : '#4ade80',
                border: 'none',
                cursor: filledItems.length > 0 ? 'pointer' : 'not-allowed',
                boxShadow: filledItems.length > 0 ? '0 8px 24px rgba(74,222,128,.3)' : 'none',
                transition: 'all .15s',
                minHeight: 52,
              }}
            >
              {phase === 'loading' ? '🌙 成長ストーリーを作成中…' : '🌟 今日の成長ストーリーを見る！'}
            </button>
          </div>
        )}

        {/* Loading */}
        {phase === 'loading' && !story && (
          <div className="text-center py-8">
            <div className="flex justify-center gap-3 mb-3">
              {['🌙','⭐','✨'].map((em, i) => (
                <span key={i} style={{ fontSize: 28, animation:'bounce-soft 1.2s ease-in-out infinite', animationDelay:`${i*.25}s`, display:'inline-block' }}>{em}</span>
              ))}
            </div>
            <p style={{ color: '#86a898', fontSize: 13 }}>今日の成長ストーリーを作ってるよ…</p>
          </div>
        )}

        {/* Story result */}
        {story && (
          <div
            className="rounded-3xl p-5 mb-4 hare-burst"
            style={{
              background: 'rgba(20,28,35,.88)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(74,222,128,.25)',
              boxShadow: '0 10px 36px rgba(74,222,128,.1)',
            }}
          >
            {/* Items recap */}
            <div className="mb-4">
              <p style={{ fontSize: 11, fontWeight: 700, color: '#4ade80', marginBottom: 8 }}>今日の良かったこと ✨</p>
              {items.filter(Boolean).map((item, i) => (
                <div key={i} className="flex items-start gap-2 mb-1.5">
                  <span style={{ fontSize: 14, marginTop: 1 }}>{'🌟⭐✨'[i]}</span>
                  <span style={{ fontSize: 13, color: '#c8e6d8', lineHeight: 1.6 }}>{item}</span>
                </div>
              ))}
            </div>

            {/* Story */}
            <div
              className="rounded-2xl p-4 mb-4"
              style={{ background:'linear-gradient(135deg,rgba(74,222,128,.08),rgba(56,189,248,.08))', border:'1px solid rgba(74,222,128,.2)' }}
            >
              <p style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8', marginBottom: 6 }}>📖 今日の成長ストーリー</p>
              <p style={{ fontSize: 14, color: '#e8f5f0', lineHeight: 1.9 }}>{story}</p>
            </div>

            {/* Points */}
            <div
              className="rounded-2xl py-3 px-4 flex items-center justify-between mb-3"
              style={{ background:'linear-gradient(135deg,rgba(74,222,128,.15),rgba(56,189,248,.15))', border:'1px solid rgba(74,222,128,.3)' }}
            >
              <div className="flex items-center gap-2">
                <span style={{ fontSize: 22 }}>🌟</span>
                <div>
                  <p style={{ fontFamily:"'M PLUS Rounded 1c', sans-serif", fontWeight:900, fontSize:13, color:'#4ade80' }}>
                    +10 晴れポイント獲得！
                  </p>
                  <p style={{ fontSize: 11, color: '#6abf8c' }}>合計 {harePoints}pt ✨</p>
                </div>
              </div>
              <span style={{ fontSize: 28, animation: 'sparkle 1s ease-in-out forwards' }}>🎉</span>
            </div>

            <button
              onClick={handleReset}
              className="w-full rounded-2xl font-bold"
              style={{
                fontFamily: "'M PLUS Rounded 1c', sans-serif",
                fontSize: 13,
                padding: '12px',
                background: 'rgba(74,222,128,.1)',
                color: '#4ade80',
                border: '1px solid rgba(74,222,128,.25)',
                cursor: 'pointer',
                minHeight: 44,
              }}
            >
              📝 もう一度記録する
            </button>
          </div>
        )}

        <p className="text-center mt-4" style={{ color: '#3d6653', fontSize: 11, lineHeight: 1.9 }}>
          毎日3つ書くだけで、<br />
          あなたの成長が積み重なっていく 🌱
        </p>
      </main>
    </div>
  )
}
