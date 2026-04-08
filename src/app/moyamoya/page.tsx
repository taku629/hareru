'use client'

import { useState, useEffect, useRef } from 'react'
import Header from '@/components/Header'
import Confetti from '@/components/Confetti'
import { getTodayRecord, saveTodayRecord, getTotalHarePoints } from '@/lib/storage'
import { getProfile } from '@/lib/profile'
import PageLoader from '@/components/PageLoader'

type Phase = 'input' | 'loading' | 'done'

export default function MoyamoyaPage() {
  const [phase, setPhase] = useState<Phase>('input')
  const [text, setText] = useState('')
  const [reframe, setReframe] = useState('')
  const [confetti, setConfetti] = useState(false)
  const [harePoints, setHarePoints] = useState(0)
  const [history, setHistory] = useState<{ text: string; reframe: string }[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [displayName, setDisplayName] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    async function load() {
      const [points, rec, profile] = await Promise.all([getTotalHarePoints(), getTodayRecord(), getProfile()])
      setHarePoints(points)
      setHistory(rec.moyamoya.map(m => ({ text: m.text, reframe: m.reframe })))
      setDisplayName(profile?.display_name ?? null)
      setAvatarUrl(profile?.avatar_url ?? null)
      setDataLoading(false)
    }
    load()
  }, [])

  async function handleSubmit() {
    if (!text.trim()) return
    setPhase('loading')
    setReframe('')
    try {
      const res = await fetch('/api/moyamoya', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() }),
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
        setReframe(full)
      }
      const rec = await getTodayRecord()
      rec.moyamoya.push({ id: Date.now().toString(), text: text.trim(), reframe: full, createdAt: new Date().toISOString() })
      rec.harePoints = (rec.harePoints || 0) + 3
      await saveTodayRecord(rec)
      setHarePoints(await getTotalHarePoints())
      setHistory(prev => [...prev, { text: text.trim(), reframe: full }])
      setConfetti(true)
      setTimeout(() => setConfetti(false), 3000)
    } catch {
      setReframe('ちょっと不安定みたい！でもモヤモヤを吐き出せただけで、もう一歩前進だよ ✨')
      setPhase('done')
    }
  }

  function handleReset() {
    setPhase('input')
    setText('')
    setReframe('')
    setTimeout(() => textareaRef.current?.focus(), 100)
  }

  const canSubmit = text.trim().length > 0 && phase === 'input'

  if (dataLoading) return <PageLoader />

  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{ background: 'linear-gradient(160deg,#f0f4ff 0%,#faf5ff 50%,#fef9f0 100%)' }}
    >
      <div className="orb" style={{ width:220,height:220,background:'radial-gradient(circle,#818cf8,transparent)',top:-60,left:-50,opacity:.2,position:'fixed',borderRadius:'50%',filter:'blur(60px)',pointerEvents:'none',zIndex:0,animation:'float 8s ease-in-out infinite' }} />
      <div className="orb" style={{ width:200,height:200,background:'radial-gradient(circle,#f472b6,transparent)',bottom:100,right:-50,opacity:.18,position:'fixed',borderRadius:'50%',filter:'blur(60px)',pointerEvents:'none',zIndex:0,animation:'float 10s ease-in-out infinite reverse' }} />

      <Header harePoints={harePoints} displayName={displayName} avatarUrl={avatarUrl} />
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
          <p style={{ fontSize: 48, marginBottom: 8, animation: 'float 5s ease-in-out infinite', lineHeight: 1 }}>🌤</p>
          <h1
            className="font-black mb-1"
            style={{
              fontFamily: "'M PLUS Rounded 1c', sans-serif",
              fontSize: 'clamp(20px, 6vw, 26px)',
              background: 'linear-gradient(135deg,#4338ca,#c084fc)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            モヤモヤを吐き出そう
          </h1>
          <p style={{ color: '#7c70b5', fontSize: 13 }}>何でも言っていいよ。ここは安全な場所 🫂</p>
        </div>

        {/* Input */}
        {phase !== 'done' && (
          <div
            className="rounded-3xl p-4 mb-4 animate-fade-up"
            style={{
              animationDelay: '0.18s', opacity: 0, animationFillMode: 'forwards',
              background: 'rgba(255,255,255,.82)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(129,140,248,.25)',
              boxShadow: '0 10px 36px rgba(129,140,248,.1)',
            }}
          >
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#4338ca', marginBottom: 10 }}>
              💭 今どんな気持ち？
            </label>
            <textarea
              ref={textareaRef}
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="就活のこと、友達のこと、授業のこと…なんでもOK！🫂"
              rows={4}
              disabled={phase === 'loading'}
              className="w-full rounded-2xl p-3"
              style={{
                background: 'rgba(240,244,255,.8)',
                border: '1.5px solid rgba(129,140,248,.3)',
                color: '#2d2050',
                fontFamily: "'Zen Maru Gothic', sans-serif",
                lineHeight: 1.8,
                fontSize: 15,
              }}
            />
            <div className="flex items-center justify-between mt-3">
              <span style={{ color: '#a89bc2', fontSize: 11 }}>
                {text.length > 0 ? `${text.length}文字` : 'Cmd+Enter でも送れるよ'}
              </span>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                style={{
                  padding: '10px 20px',
                  borderRadius: 16,
                  fontFamily: "'M PLUS Rounded 1c', sans-serif",
                  fontWeight: 800,
                  fontSize: 14,
                  color: 'white',
                  background: canSubmit ? 'linear-gradient(135deg,#818cf8,#c084fc)' : 'rgba(200,195,220,.5)',
                  border: 'none',
                  cursor: canSubmit ? 'pointer' : 'not-allowed',
                  boxShadow: canSubmit ? '0 6px 20px rgba(129,140,248,.4)' : 'none',
                  minHeight: 44,
                  transition: 'all .15s',
                }}
              >
                {phase === 'loading' ? '考え中…🌀' : '晴らす ✨'}
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {phase === 'loading' && !reframe && (
          <div className="text-center py-8">
            <div className="flex justify-center gap-3 mb-3">
              {['💭','🌤','✨'].map((em, i) => (
                <span key={i} style={{ fontSize: 28, animation: 'bounce-soft 1.2s ease-in-out infinite', animationDelay:`${i*.25}s`, display:'inline-block' }}>{em}</span>
              ))}
            </div>
            <p style={{ color: '#7c70b5', fontSize: 13 }}>あなたのモヤモヤを受け取ってるよ…</p>
          </div>
        )}

        {/* Reframe result */}
        {reframe && (
          <div
            className="rounded-3xl p-5 mb-4 hare-burst"
            style={{
              background: 'rgba(255,255,255,.85)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(129,140,248,.25)',
              boxShadow: '0 10px 36px rgba(129,140,248,.1)',
            }}
          >
            {/* Original */}
            <div className="rounded-2xl p-3 mb-4" style={{ background: 'rgba(129,140,248,.08)', border: '1px solid rgba(129,140,248,.15)' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#7c70b5', marginBottom: 4 }}>あなたのモヤモヤ</p>
              <p style={{ fontSize: 13, color: '#4c3d70', lineHeight: 1.7 }}>{text}</p>
            </div>
            {/* Reframe */}
            <div className="flex gap-2 mb-4">
              <span style={{ fontSize: 22, flexShrink: 0, lineHeight: 1.3 }}>☀️</span>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#ea580c', marginBottom: 6 }}>晴れ心パートナーより</p>
                <p style={{ fontSize: 14, color: '#2d1a10', lineHeight: 1.9 }}>{reframe}</p>
              </div>
            </div>
            {/* Result bar */}
            <div
              className="rounded-2xl py-3 px-4 flex items-center justify-between"
              style={{
                background: 'linear-gradient(135deg,rgba(74,222,128,.12),rgba(52,211,153,.12))',
                border: '1px solid rgba(74,222,128,.3)',
              }}
            >
              <div className="flex items-center gap-2">
                <span style={{ fontSize: 22 }}>✅</span>
                <span style={{ fontFamily: "'M PLUS Rounded 1c', sans-serif", fontWeight: 700, fontSize: 13, color: '#16a34a' }}>
                  晴れた！ +3pt
                </span>
              </div>
              <button
                onClick={handleReset}
                style={{
                  background: 'rgba(251,146,60,.15)', color: '#ea580c',
                  border: '1px solid rgba(251,146,60,.25)',
                  borderRadius: 12, padding: '7px 12px',
                  fontSize: 12, fontWeight: 700, cursor: 'pointer', minHeight: 36,
                }}
              >
                もう一つ
              </button>
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && phase === 'input' && (
          <div className="animate-fade-up" style={{ animationDelay: '0.3s', opacity: 0, animationFillMode: 'forwards' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#a89bc2', marginBottom: 10 }}>📝 今日の記録</p>
            {history.slice(-3).reverse().map((item, i) => (
              <div
                key={i}
                className="rounded-2xl p-4 mb-3"
                style={{ background: 'rgba(255,255,255,.65)', border: '1px solid rgba(129,140,248,.15)' }}
              >
                <p style={{ fontSize: 11, fontWeight: 700, color: '#7c70b5', marginBottom: 4 }}>モヤモヤ</p>
                <p style={{ fontSize: 13, color: '#4c3d70', lineHeight: 1.6, marginBottom: 6 }}>{item.text}</p>
                <p style={{ fontSize: 12, color: '#9a8abf', lineHeight: 1.6 }}>{item.reframe}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
