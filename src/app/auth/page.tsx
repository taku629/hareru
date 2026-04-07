'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Mode = 'login' | 'signup'

export default function AuthPage() {
  const router = useRouter()

  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleGoogleLogin() {
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    const supabase = createClient()

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${location.origin}/auth/callback` },
      })
      if (error) {
        setError(error.message)
      } else {
        setMessage('確認メールを送りました！メールを確認してね 📧')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError('メールアドレスかパスワードが違うよ 🙈')
      } else {
        router.push('/')
        router.refresh()
      }
    }
    setLoading(false)
  }

  return (
    <div
      className="min-h-screen relative overflow-x-hidden flex items-center justify-center"
      style={{ background: 'linear-gradient(160deg,#fef9f0 0%,#fff0f5 50%,#f0f4ff 100%)' }}
    >
      {/* 背景オーブ */}
      <div style={{ position:'fixed', width:260, height:260, borderRadius:'50%', filter:'blur(80px)', opacity:.25, pointerEvents:'none', zIndex:0, background:'radial-gradient(circle,#fb923c,transparent)', top:-80, left:-80, animation:'float 8s ease-in-out infinite' }} />
      <div style={{ position:'fixed', width:220, height:220, borderRadius:'50%', filter:'blur(80px)', opacity:.2, pointerEvents:'none', zIndex:0, background:'radial-gradient(circle,#f472b6,transparent)', bottom:-60, right:-60, animation:'float 10s ease-in-out infinite reverse' }} />
      <div style={{ position:'fixed', width:180, height:180, borderRadius:'50%', filter:'blur(70px)', opacity:.18, pointerEvents:'none', zIndex:0, background:'radial-gradient(circle,#818cf8,transparent)', top:'40%', right:'10%', animation:'float 12s ease-in-out infinite 2s' }} />

      <div
        className="relative z-10 w-full max-w-sm mx-auto px-5 py-10"
        style={{ minHeight: '100dvh', display:'flex', flexDirection:'column', justifyContent:'center' }}
      >
        {/* ロゴ */}
        <div className="text-center mb-8">
          <p style={{ fontSize: 56, marginBottom: 8, animation: 'float 4s ease-in-out infinite', lineHeight: 1 }}>☀️</p>
          <h1
            className="font-black mb-2"
            style={{
              fontFamily: "'M PLUS Rounded 1c', sans-serif",
              fontSize: 36,
              background: 'linear-gradient(135deg,#fb923c,#f472b6,#818cf8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            はれる
          </h1>
          <p style={{ color: '#a87c60', fontSize: 13, lineHeight: 1.7 }}>
            モヤモヤを晴らして、<br />毎日をちょっと軽くするアプリ ✨
          </p>
        </div>

        {/* カード */}
        <div
          className="rounded-3xl p-6"
          style={{
            background: 'rgba(255,255,255,0.82)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(251,146,60,0.2)',
            boxShadow: '0 16px 48px rgba(251,146,60,0.12)',
          }}
        >
          {/* Google ログイン / 新規登録 */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full rounded-2xl font-bold flex items-center justify-center gap-3 mb-2"
            style={{
              padding: '14px 20px',
              background: 'white',
              border: '1.5px solid rgba(0,0,0,0.12)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              fontSize: 15,
              color: '#2d1a10',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: "'M PLUS Rounded 1c', sans-serif",
              minHeight: 52,
              transition: 'all .15s',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Googleでログイン / 新規登録
          </button>
          <p style={{ textAlign: 'center', fontSize: 11, color: '#b08060', marginBottom: 16 }}>
            はじめての方もGoogleですぐ始められます ✨
          </p>

          {/* 区切り */}
          <div className="flex items-center gap-3 mb-5">
            <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.08)' }} />
            <span style={{ fontSize: 12, color: '#b08060' }}>または</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.08)' }} />
          </div>

          {/* タブ切り替え */}
          <div
            className="flex rounded-2xl p-1 mb-5"
            style={{ background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.15)' }}
          >
            {(['login', 'signup'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); setMessage('') }}
                className="flex-1 rounded-xl font-bold"
                style={{
                  padding: '9px 8px',
                  fontSize: 13,
                  fontFamily: "'M PLUS Rounded 1c', sans-serif",
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all .18s',
                  background: mode === m ? 'white' : 'transparent',
                  color: mode === m ? '#ea580c' : '#b08060',
                  boxShadow: mode === m ? '0 2px 8px rgba(251,146,60,0.15)' : 'none',
                  minHeight: 36,
                }}
              >
                {m === 'login' ? 'ログイン' : '新規登録'}
              </button>
            ))}
          </div>

          {/* フォーム */}
          <form onSubmit={handleEmailAuth}>
            <div className="mb-3">
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
            <div className="mb-5">
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#a87c60', marginBottom: 6 }}>
                パスワード
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

            {error && (
              <div
                className="rounded-2xl px-4 py-3 mb-4 text-center"
                style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', color: '#be123c', fontSize: 13 }}
              >
                {error}
              </div>
            )}
            {message && (
              <div
                className="rounded-2xl px-4 py-3 mb-4 text-center"
                style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.25)', color: '#16a34a', fontSize: 13 }}
              >
                {message}
              </div>
            )}

            {mode === 'login' && (
              <div className="text-right mb-3">
                <Link href="/auth/reset" style={{ fontSize: 12, color: '#b08060', textDecoration: 'none' }}>
                  パスワードを忘れた？
                </Link>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-hareru w-full rounded-2xl text-white font-black"
              style={{
                fontFamily: "'M PLUS Rounded 1c', sans-serif",
                fontSize: 16,
                padding: '15px 24px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 8px 28px rgba(251,146,60,0.35)',
                minHeight: 52,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? '処理中…' : mode === 'login' ? '☀️ ログイン' : '✨ 新規登録'}
            </button>
          </form>
        </div>

        <p className="text-center mt-6" style={{ color: '#c9a88e', fontSize: 11, lineHeight: 1.9 }}>
          ログインして、あなただけの晴れ記録を始めよう 🌤
        </p>
      </div>
    </div>
  )
}
