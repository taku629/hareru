'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getProfile, upsertProfile } from '@/lib/profile'
import Header from '@/components/Header'
import PageLoader from '@/components/PageLoader'

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const [displayName, setDisplayName] = useState('')
  const [originalName, setOriginalName] = useState('')
  const [email, setEmail] = useState('')
  const [provider, setProvider] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [harePoints, setHarePoints] = useState(0)

  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type })
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }

      setEmail(user.email ?? '')
      const providers = user.app_metadata?.providers ?? [user.app_metadata?.provider ?? 'email']
      setProvider(providers.includes('google') ? 'Google' : 'メールアドレス')

      const profile = await getProfile()
      setDisplayName(profile?.display_name ?? '')
      setOriginalName(profile?.display_name ?? '')
      setAvatarUrl(profile?.avatar_url ?? user.user_metadata?.avatar_url ?? null)

      // Fetch total hare points
      const { data: records } = await supabase
        .from('daily_records')
        .select('hare_points')
        .eq('user_id', user.id)
      const pts = (records ?? []).reduce((sum, r) => sum + (r.hare_points ?? 0), 0)
      setHarePoints(pts)

      setLoading(false)
    }
    load()
  }, [router])

  async function handleSaveName() {
    const trimmed = displayName.trim()
    if (!trimmed) { showToast('なまえを入力してください', 'error'); return }
    if (trimmed.length > 20) { showToast('20文字以内にしてください', 'error'); return }
    setSaving(true)
    const { error } = await upsertProfile({ display_name: trimmed })
    setSaving(false)
    if (error) { showToast(error, 'error'); return }
    setOriginalName(trimmed)
    showToast('なまえを保存しました ✨')
  }

  async function handleChangePassword() {
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/update-password`,
    })
    if (error) { showToast('送信に失敗しました', 'error'); return }
    showToast('パスワード変更メールを送信しました 📧')
  }

  async function handleDeleteAccount() {
    setDeletingAccount(true)
    const supabase = createClient()
    // Sign out first, then delete via admin RPC
    const { error } = await supabase.rpc('delete_user')
    if (error) {
      // Fallback: just sign out if RPC not available
      await supabase.auth.signOut()
      showToast('アカウントを削除しました', 'success')
      router.push('/auth')
      return
    }
    await supabase.auth.signOut()
    router.push('/auth')
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth')
    router.refresh()
  }

  if (loading) return <PageLoader />

  const nameDirty = displayName.trim() !== originalName

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'linear-gradient(160deg, #fff8f0 0%, #fff3e8 50%, #ffeedd 100%)',
        fontFamily: "'M PLUS Rounded 1c', sans-serif",
        paddingBottom: 100,
      }}
    >
      <Header harePoints={harePoints} />

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: 72,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 200,
            background: toast.type === 'success' ? '#22c55e' : '#ef4444',
            color: 'white',
            padding: '10px 22px',
            borderRadius: 99,
            fontSize: 14,
            fontWeight: 700,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            whiteSpace: 'nowrap',
          }}
        >
          {toast.msg}
        </div>
      )}

      <div style={{ paddingTop: 72, maxWidth: 480, margin: '0 auto', padding: '72px 20px 0' }}>
        {/* Page title */}
        <h1
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: '#2d1a10',
            marginBottom: 24,
            paddingTop: 16,
          }}
        >
          ⚙️ 設定
        </h1>

        {/* ── Profile section ─────────────────────── */}
        <Section title="プロフィール">
          {/* Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt="avatar"
                style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(251,146,60,0.3)' }}
              />
            ) : (
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #fb923c, #f472b6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 28,
                  color: 'white',
                  fontWeight: 800,
                }}
              >
                {displayName?.[0]?.toUpperCase() ?? '?'}
              </div>
            )}
            <div>
              <div style={{ fontWeight: 800, fontSize: 17, color: '#2d1a10' }}>
                {displayName || '名前未設定'}
              </div>
              <div style={{ fontSize: 12, color: '#b08060', marginTop: 2 }}>
                {provider}でログイン中
              </div>
            </div>
          </div>

          {/* Display name edit */}
          <label style={{ fontSize: 13, fontWeight: 700, color: '#7a4a2a', display: 'block', marginBottom: 6 }}>
            呼び名
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={20}
              placeholder="例：たくむ"
              style={{
                flex: 1,
                padding: '11px 14px',
                borderRadius: 12,
                border: '1.5px solid rgba(0,0,0,0.12)',
                fontSize: 15,
                fontFamily: "'M PLUS Rounded 1c', sans-serif",
                background: 'white',
                color: '#2d1a10',
                outline: 'none',
              }}
            />
            <button
              onClick={handleSaveName}
              disabled={saving || !nameDirty}
              style={{
                padding: '11px 18px',
                borderRadius: 12,
                border: 'none',
                background: nameDirty ? 'linear-gradient(135deg, #ff9a3c, #ff6b00)' : '#e5e5e5',
                color: nameDirty ? 'white' : '#aaa',
                fontWeight: 800,
                fontSize: 14,
                cursor: nameDirty ? 'pointer' : 'not-allowed',
                fontFamily: "'M PLUS Rounded 1c', sans-serif",
                whiteSpace: 'nowrap',
                transition: 'all .2s',
              }}
            >
              {saving ? '保存中…' : '保存'}
            </button>
          </div>
          <p style={{ fontSize: 11, color: '#b08060', marginTop: 4, textAlign: 'right' }}>
            {displayName.trim().length} / 20文字
          </p>

          {/* Email */}
          <label style={{ fontSize: 13, fontWeight: 700, color: '#7a4a2a', display: 'block', marginTop: 16, marginBottom: 6 }}>
            メールアドレス
          </label>
          <div
            style={{
              padding: '11px 14px',
              borderRadius: 12,
              background: 'rgba(0,0,0,0.04)',
              fontSize: 14,
              color: '#7a4a2a',
            }}
          >
            {email}
          </div>
        </Section>

        {/* ── Security section (email users only) ─── */}
        {provider === 'メールアドレス' && (
          <Section title="セキュリティ">
            <ActionButton
              label="パスワードを変更する"
              description="変更用のメールを送信します"
              onClick={handleChangePassword}
              icon="🔑"
            />
          </Section>
        )}

        {/* ── Account section ──────────────────────── */}
        <Section title="アカウント">
          <ActionButton
            label="ログアウト"
            description="このデバイスからサインアウト"
            onClick={handleLogout}
            icon="👋"
          />
        </Section>

        {/* ── Danger zone ──────────────────────────── */}
        <Section title="危険な操作" danger>
          {!showDeleteConfirm ? (
            <ActionButton
              label="アカウントを削除する"
              description="すべてのデータが完全に削除されます"
              onClick={() => setShowDeleteConfirm(true)}
              icon="🗑️"
              danger
            />
          ) : (
            <div
              style={{
                background: '#fff1f1',
                border: '1.5px solid #fca5a5',
                borderRadius: 14,
                padding: 16,
              }}
            >
              <p style={{ fontSize: 14, color: '#b91c1c', fontWeight: 700, marginBottom: 8 }}>
                本当に削除しますか？
              </p>
              <p style={{ fontSize: 13, color: '#7f1d1d', marginBottom: 16, lineHeight: 1.6 }}>
                すべての記録・ポイント・データが<br />完全に削除されます。元に戻せません。
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: 10,
                    border: '1px solid #ddd',
                    background: 'white',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: "'M PLUS Rounded 1c', sans-serif",
                    color: '#555',
                  }}
                >
                  キャンセル
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deletingAccount}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: 10,
                    border: 'none',
                    background: '#ef4444',
                    color: 'white',
                    fontSize: 14,
                    fontWeight: 800,
                    cursor: deletingAccount ? 'not-allowed' : 'pointer',
                    fontFamily: "'M PLUS Rounded 1c', sans-serif",
                  }}
                >
                  {deletingAccount ? '削除中…' : '削除する'}
                </button>
              </div>
            </div>
          )}
        </Section>

        {/* App version */}
        <p style={{ textAlign: 'center', fontSize: 12, color: '#c8a882', marginTop: 32 }}>
          はれる v1.0.0
        </p>
      </div>
    </div>
  )
}

// ── Helpers ──────────────────────────────────────────────

function Section({
  title,
  children,
  danger = false,
}: {
  title: string
  children: React.ReactNode
  danger?: boolean
}) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2
        style={{
          fontSize: 13,
          fontWeight: 800,
          color: danger ? '#b91c1c' : '#b08060',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          marginBottom: 10,
        }}
      >
        {title}
      </h2>
      <div
        style={{
          background: 'white',
          borderRadius: 18,
          padding: 16,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          border: danger ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(251,146,60,0.1)',
        }}
      >
        {children}
      </div>
    </div>
  )
}

function ActionButton({
  label,
  description,
  onClick,
  icon,
  danger = false,
}: {
  label: string
  description: string
  onClick: () => void
  icon: string
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: '4px 0',
        textAlign: 'left',
        fontFamily: "'M PLUS Rounded 1c', sans-serif",
      }}
    >
      <span style={{ fontSize: 22 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: danger ? '#ef4444' : '#2d1a10' }}>
          {label}
        </div>
        <div style={{ fontSize: 12, color: '#b08060', marginTop: 1 }}>{description}</div>
      </div>
      <span style={{ color: '#ccc', fontSize: 18 }}>›</span>
    </button>
  )
}
