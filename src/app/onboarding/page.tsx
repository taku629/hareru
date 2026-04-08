'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { upsertProfile } from '@/lib/profile'
import { createClient } from '@/lib/supabase/client'

export default function OnboardingPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) { setError('なまえを入力してください'); return }
    if (trimmed.length > 20) { setError('20文字以内にしてください'); return }

    setLoading(true)
    setError('')

    // Sync Google avatar if available
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const avatarUrl = user?.user_metadata?.avatar_url ?? null

    const { error: err } = await upsertProfile({ display_name: trimmed, avatar_url: avatarUrl })
    if (err) { setError(err); setLoading(false); return }

    router.push('/')
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 24px',
        background: 'linear-gradient(160deg, #fff8f0 0%, #fff3e8 50%, #ffeedd 100%)',
        fontFamily: "'M PLUS Rounded 1c', sans-serif",
      }}
    >
      {/* Sun illustration */}
      <div style={{ fontSize: 64, marginBottom: 8 }}>☀️</div>
      <h1
        style={{
          fontSize: 26,
          fontWeight: 800,
          color: '#2d1a10',
          marginBottom: 8,
          textAlign: 'center',
        }}
      >
        はじめまして！
      </h1>
      <p
        style={{
          fontSize: 15,
          color: '#7a4a2a',
          textAlign: 'center',
          marginBottom: 36,
          lineHeight: 1.7,
        }}
      >
        呼んでほしいなまえを教えてください。<br />あとからいつでも変えられます ✨
      </p>

      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 340 }}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例：たくむ、さくら"
          maxLength={20}
          autoFocus
          style={{
            width: '100%',
            padding: '14px 18px',
            borderRadius: 16,
            border: '1.5px solid rgba(0,0,0,0.12)',
            fontSize: 17,
            fontFamily: "'M PLUS Rounded 1c', sans-serif",
            background: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            outline: 'none',
            boxSizing: 'border-box',
            color: '#2d1a10',
            marginBottom: 8,
          }}
        />
        <p style={{ fontSize: 12, color: '#b08060', textAlign: 'right', marginBottom: 20 }}>
          {name.trim().length} / 20文字
        </p>

        {error && (
          <p style={{ color: '#e05050', fontSize: 13, marginBottom: 12, textAlign: 'center' }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !name.trim()}
          style={{
            width: '100%',
            padding: '15px',
            borderRadius: 16,
            border: 'none',
            background: loading || !name.trim()
              ? '#ddd'
              : 'linear-gradient(135deg, #ff9a3c 0%, #ff6b00 100%)',
            color: 'white',
            fontSize: 16,
            fontWeight: 800,
            cursor: loading || !name.trim() ? 'not-allowed' : 'pointer',
            fontFamily: "'M PLUS Rounded 1c', sans-serif",
            boxShadow: loading || !name.trim() ? 'none' : '0 4px 16px rgba(255,107,0,0.35)',
            transition: 'all .2s',
          }}
        >
          {loading ? '設定中...' : 'はじめる ☀️'}
        </button>
      </form>
    </div>
  )
}
