'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import AuthShell, { authErrorStyle, authInputStyle, authLabelStyle, authSubmitStyle } from '@/components/auth/AuthShell'

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
    <AuthShell
      icon="🔐"
      title="新しいパスワード"
      subtitle="新しいパスワードを設定してね"
    >
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label style={authLabelStyle}>
            新しいパスワード
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder="6文字以上"
            className="w-full rounded-xl px-4 py-3"
            style={authInputStyle}
          />
        </div>
        <div className="mb-5">
          <label style={authLabelStyle}>
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
              ...authInputStyle,
              border: `1.5px solid ${confirm && confirm !== password ? 'rgba(244,63,94,0.4)' : 'rgba(251,146,60,0.2)'}`,
            }}
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
          className="btn-hareru w-full rounded-2xl text-white font-black"
          style={{
            ...authSubmitStyle,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? '更新中…' : '🔐 パスワードを更新する'}
        </button>
      </form>
    </AuthShell>
  )
}
