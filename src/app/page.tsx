'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Confetti from '@/components/Confetti'
import {
  getTodayRecord,
  saveTodayRecord,
  getRecentContext,
  getTotalHarePoints,
} from '@/lib/storage'
import { getProfile } from '@/lib/profile'
import PageLoader from '@/components/PageLoader'

type Phase = 'idle' | 'loading' | 'done'

export default function MorningPage() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [message, setMessage] = useState('')
  const [confetti, setConfetti] = useState(false)
  const [harePoints, setHarePoints] = useState(0)
  const [alreadyDone, setAlreadyDone] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [displayName, setDisplayName] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const [points, rec, profile] = await Promise.all([getTotalHarePoints(), getTodayRecord(), getProfile()])
      setHarePoints(points)
      setDisplayName(profile?.display_name ?? null)
      setAvatarUrl(profile?.avatar_url ?? null)
      if (rec.morningMessage) {
        setMessage(rec.morningMessage)
        setPhase('done')
        setAlreadyDone(true)
      }
      setDataLoading(false)
    }
    load()
  }, [])

  async function handleTap() {
    setPhase('loading')
    setMessage('')
    try {
      const context = await getRecentContext()
      const res = await fetch('/api/morning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context }),
      })
      if (!res.ok || !res.body) throw new Error()

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let full = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        full += chunk
        setMessage(full)
        setPhase('done')
      }

      if (!alreadyDone) {
        const rec = await getTodayRecord()
        rec.morningMessage = full
        rec.harePoints = (rec.harePoints || 0) + 5
        await saveTodayRecord(rec)
        setHarePoints(await getTotalHarePoints())
      }
      setConfetti(true)
      setTimeout(() => setConfetti(false), 3000)
    } catch {
      setMessage('うわー、ちょっと接続が不安定みたい！でも今日も絶対いい日だよ ☀️✨ また少したったらタップしてね！')
      setPhase('done')
    }
  }

  const greetingEmoji = () => {
    const h = new Date().getHours()
    if (h < 10) return '🌅'
    if (h < 17) return '☀️'
    return '🌙'
  }
  const greetingText = () => {
    const h = new Date().getHours()
    if (h < 10) return 'おはよう！'
    if (h < 17) return 'こんにちは！'
    return 'こんばんは！'
  }

  if (dataLoading) return <PageLoader />

  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{ background: 'linear-gradient(160deg,#fef9f0 0%,#fff0f5 50%,#f0f4ff 100%)' }}
    >
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <Header harePoints={harePoints} displayName={displayName} avatarUrl={avatarUrl} />
      <Confetti active={confetti} />

      {/* pt-[topbar] pb-[bottomnav + safe-bottom] */}
      <main
        className="relative z-10 max-w-lg mx-auto px-4 scroll-area"
        style={{
          paddingTop: 'calc(var(--safe-top) + 68px)',
          paddingBottom: 'calc(var(--nav-h) + var(--safe-bottom) + 16px)',
          minHeight: '100dvh',
        }}
      >
        {/* Greeting */}
        <div
          className="text-center mb-6 animate-fade-up"
          style={{ animationDelay: '0.08s', opacity: 0, animationFillMode: 'forwards' }}
        >
          <p className="mb-2" style={{ fontSize: 52, animation: 'float 4s ease-in-out infinite', lineHeight: 1 }}>
            {greetingEmoji()}
          </p>
          <h1
            className="font-black mb-1"
            style={{
              fontFamily: "'M PLUS Rounded 1c', sans-serif",
              fontSize: 'clamp(22px, 7vw, 32px)',
              background: 'linear-gradient(135deg,#ea580c,#f472b6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {greetingText()}
          </h1>
          <p style={{ color: '#92684e', fontSize: 14 }}>今日も一緒に晴れていこう ✨</p>
        </div>

        {/* Main card */}
        <div
          className="rounded-3xl p-5 mb-4 animate-fade-up"
          style={{
            animationDelay: '0.18s', opacity: 0, animationFillMode: 'forwards',
            background: 'rgba(255,255,255,0.78)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(251,146,60,0.22)',
            boxShadow: '0 10px 36px rgba(251,146,60,0.1)',
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span style={{ fontSize: 18 }}>🌤</span>
            <span
              className="font-bold"
              style={{ color: '#c2410c', fontFamily: "'M PLUS Rounded 1c', sans-serif", fontSize: 16 }}
            >
              今日のはれる
            </span>
            {alreadyDone && (
              <span
                className="ml-auto text-xs font-bold px-2 py-1 rounded-full"
                style={{ background: 'rgba(74,222,128,.15)', color: '#16a34a' }}
              >
                ✅ 受け取り済み
              </span>
            )}
          </div>

          {phase === 'idle' && (
            <div className="text-center py-4">
              <p style={{ color: '#a87c60', fontSize: 13, lineHeight: 1.8, marginBottom: 20 }}>
                タップするだけで、今日のあなた専用の<br />
                <strong style={{ color: '#ea580c' }}>晴れメッセージ</strong>が届くよ ☀️
              </p>
              <button
                onClick={handleTap}
                className="btn-hareru w-full rounded-2xl text-white font-black"
                style={{
                  fontFamily: "'M PLUS Rounded 1c', sans-serif",
                  fontSize: 17,
                  padding: '16px 24px',
                  border: 'none',
                  cursor: 'pointer',
                  letterSpacing: '0.04em',
                  boxShadow: '0 8px 28px rgba(251,146,60,.35)',
                }}
              >
                ☀️ 今日のはれるをもらう！
              </button>
            </div>
          )}

          {phase === 'loading' && !message && (
            <div className="text-center py-8">
              <div className="flex justify-center gap-3 mb-3">
                {['🌤','☀️','✨'].map((em, i) => (
                  <span key={i} style={{ fontSize: 28, animation: 'bounce-soft 1.2s ease-in-out infinite', animationDelay: `${i*0.2}s`, display:'inline-block' }}>{em}</span>
                ))}
              </div>
              <p style={{ color: '#a87c60', fontSize: 13 }}>あなただけのメッセージを準備中…</p>
            </div>
          )}

          {message && (
            <div
              className="rounded-2xl p-4 hare-burst"
              style={{
                background: 'linear-gradient(135deg,rgba(251,146,60,.08),rgba(244,114,182,.08))',
                border: '1px solid rgba(251,146,60,.2)',
              }}
            >
              <p style={{ color: '#3d2010', fontSize: 14, lineHeight: 1.9 }}>{message}</p>
            </div>
          )}

          {phase === 'done' && message && (
            <div className="mt-3 text-center">
              <button
                onClick={handleTap}
                style={{
                  background: 'rgba(251,146,60,.1)',
                  color: '#ea580c',
                  border: '1px solid rgba(251,146,60,.22)',
                  borderRadius: 99,
                  padding: '8px 16px',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  minHeight: 36,
                }}
              >
                🔄 もう一度もらう
              </button>
            </div>
          )}
        </div>

        {/* Quick links */}
        <div
          className="grid grid-cols-2 gap-3 mb-4 animate-fade-up"
          style={{ animationDelay: '0.28s', opacity: 0, animationFillMode: 'forwards' }}
        >
          {[
            { href: '/moyamoya', emoji: '🌤', label: 'モヤモヤを吐き出す', sub: 'いつでもOK', borderColor: 'rgba(129,140,248,.25)', shadow: 'rgba(129,140,248,.1)', color: '#4338ca' },
            { href: '/yokatta',  emoji: '🌙', label: '今日の良かったこと', sub: '夜に記録',   borderColor: 'rgba(74,222,128,.25)',   shadow: 'rgba(74,222,128,.1)',   color: '#166534' },
          ].map(card => (
            <a
              key={card.href}
              href={card.href}
              className="rounded-2xl p-4 text-center"
              style={{
                background: 'rgba(255,255,255,.72)',
                border: `1px solid ${card.borderColor}`,
                boxShadow: `0 4px 18px ${card.shadow}`,
                textDecoration: 'none',
                display: 'block',
                minHeight: 88,
              }}
            >
              <div style={{ fontSize: 30, marginBottom: 6, animation: 'float 5s ease-in-out infinite 0.5s' }}>{card.emoji}</div>
              <div style={{ fontFamily: "'M PLUS Rounded 1c', sans-serif", fontWeight: 700, fontSize: 13, color: card.color }}>{card.label}</div>
              <div style={{ fontSize: 11, marginTop: 2, color: '#a09080' }}>{card.sub}</div>
            </a>
          ))}
        </div>

        {/* Points */}
        <div
          className="rounded-2xl p-4 flex items-center justify-between animate-fade-up"
          style={{
            animationDelay: '0.36s', opacity: 0, animationFillMode: 'forwards',
            background: 'rgba(255,255,255,.6)',
            border: '1px solid rgba(251,146,60,.15)',
          }}
        >
          <span style={{ color: '#a87c60', fontSize: 13 }}>累計 晴れポイント</span>
          <span
            style={{
              fontFamily: "'M PLUS Rounded 1c', sans-serif",
              fontWeight: 900,
              fontSize: 18,
              background: 'linear-gradient(135deg,#fb923c,#f472b6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {harePoints} ✨ pt
          </span>
        </div>

        <p className="text-center mt-5" style={{ color: '#c9a88e', fontSize: 11, lineHeight: 1.9 }}>
          モヤモヤを1タップで晴らす。<br />
          東京の大学生のためのAI晴れ心パートナー。
        </p>
      </main>
    </div>
  )
}
