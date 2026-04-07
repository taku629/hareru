'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function ResetPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/update-password`,
    })
    if (error) {
      setError(error.message)
    } else {
      setDone(true)
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
          <p style={{ fontSize: 48, marginBottom: 8, animation: 'float 4s ease-in-out infinite', lineHeight: 1 }}>🔑</p>
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
            パスワードをリセット
          </h1>
          <p style={{ color: '#a87c60', fontSize: 13 }}>登録したメールアドレスを入力してね</p>
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
          {done ? (
            <div className="text-center py-4">
              <p style={{ fontSize: 40, marginBottom: 12 }}>📧</p>
              <p style={{ fontSize: 14, color: '#2d1a10', lineHeight: 1.8, marginBottom: 20 }}>
                リセット用のメールを送ったよ！<br />メールを確認してね ✨
              </p>
              <Link
                href="/auth"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '12px',
                  borderRadius: 16,
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: "'M PLUS Rounded 1c', sans-serif",
                  color: '#ea580c',
                  background: 'rgba(251,146,60,0.1)',
                  border: '1px solid rgba(251,146,60,0.2)',
                  textDecoration: 'none',
                }}
              >
                ログインページへ戻る
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#a87c60', marginBottom: 6 }}>
                  メールアドレス
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="hello@example.com"
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
                className="btn-hareru w-full rounded-2xl text-white font-black mb-3"
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
                {loading ? '送信中…' : '📧 リセットメールを送る'}
              </button>

              <Link
                href="/auth"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  fontSize: 13,
                  color: '#b08060',
                  textDecoration: 'none',
                }}
              >
                ← ログインに戻る
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
