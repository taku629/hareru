'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import AuthShell, { authErrorStyle, authInputStyle, authLabelStyle, authSubmitStyle } from '@/components/auth/AuthShell'

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
    <AuthShell
      icon="🔑"
      title="パスワードをリセット"
      subtitle="登録したメールアドレスを入力してね"
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
            <label style={authLabelStyle}>
              メールアドレス
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="hello@example.com"
              className="w-full rounded-xl px-4 py-3"
              style={authInputStyle}
            />
          </div>

          {error && (
            <div
              className="rounded-2xl px-4 py-3 mb-4 text-center"
              style={authErrorStyle}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-hareru w-full rounded-2xl text-white font-black mb-3"
            style={{
              ...authSubmitStyle,
              cursor: loading ? 'not-allowed' : 'pointer',
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
    </AuthShell>
  )
}
