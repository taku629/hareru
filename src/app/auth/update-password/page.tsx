'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      setError('パスワードが一致しないよ 🙈')
      return
    }
    if (password.length < 6) {
      setError('パスワードは6文字以上にしてね')
      return
    }
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
    } else {
      router.push('/')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-5"
      style={{ background: 'linear-gradient(160deg,#fef9f0 0%,#fff0f5 50%,#f0f4ff 100%)' }}
    >
      <div style={{ width: '100%', maxWidth: 360 }}>
        <div className="text-center mb-8">
          <p style={{ fontSize: 48, marginBottom: 8, animation: 'float 4s ease-in-out infinite', lineHeight: 1 }}>🔐</p>
          <h1
            className="font-black mb-2"
            style={{
              fontFamily: "'M PLUS Rounded 1c', sans-serif",
              fontSize: 24,
              background: 'linear-gradient(135deg,#fb923c,#f472b6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            新しいパスワード
          </h1>
          <p style={{ color: '#a87c60', fontSize: 13 }}>新しいパスワードを設定してね</p>
        </div>

        <div
          className="rounded-3xl p-6"
          style={{
            background: 'rgba(255,255,255,0.82)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(251,146,60,0.2)',
            boxShadow: '0 16px 48px rgba(251,146,60,0.12)',
          }}
        >
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#a87c60', marginBottom: 6 }}>
                新しいパスワード
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="6文字以上"
                className="w-full rounded-xl px-4 py-3"
                style={{
                  background: 'rgba(255,249,240,0.9)',
                  border: '1.5px solid rgba(251,146,60,0.2)',
                  color: '#2d1a10',
                  fontSize: 15,
                  fontFamily: "'Zen Maru Gothic', sans-serif",
                  outline: 'none',
                  minHeight: 48,
                }}
              />
            </div>
            <div className="mb-5">
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#a87c60', marginBottom: 6 }}>
                確認（もう一度）
              </label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                placeholder="同じパスワードをもう一度"
                className="w-full rounded-xl px-4 py-3"
                style={{
                  background: 'rgba(255,249,240,0.9)',
                  border: `1.5px solid ${confirm && confirm !== password ? 'rgba(244,63,94,0.4)' : 'rgba(251,146,60,0.2)'}`,
                  color: '#2d1a10',
                  fontSize: 15,
                  fontFamily: "'Zen Maru Gothic', sans-serif",
                  outline: 'none',
                  minHeight: 48,
                }}
              />
            </div>

            {error && (
              <div
                className="rounded-2xl px-4 py-3 mb-4 text-center"
                style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', color: '#be123c', fontSize: 13 }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-hareru w-full rounded-2xl text-white font-black"
              style={{
                fontFamily: "'M PLUS Rounded 1c', sans-serif",
                fontSize: 15,
                padding: '14px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 8px 28px rgba(251,146,60,0.35)',
                minHeight: 52,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? '更新中…' : '🔐 パスワードを更新する'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
