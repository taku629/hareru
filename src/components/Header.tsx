'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const tabs = [
  { href: '/',          label: '朝',    emoji: '☀️', activeColor: '#ea580c', activeBg: 'rgba(251,146,60,0.15)', borderColor: 'rgba(251,146,60,0.3)' },
  { href: '/moyamoya', label: '日中',  emoji: '🌤', activeColor: '#4338ca', activeBg: 'rgba(129,140,248,0.15)', borderColor: 'rgba(129,140,248,0.3)' },
  { href: '/yokatta',  label: '夜',    emoji: '🌙', activeColor: '#16a34a', activeBg: 'rgba(74,222,128,0.15)',  borderColor: 'rgba(74,222,128,0.3)'  },
  { href: '/stats',    label: '記録',  emoji: '📊', activeColor: '#c2410c', activeBg: 'rgba(251,146,60,0.15)', borderColor: 'rgba(251,146,60,0.3)'  },
]

export default function Header({ harePoints = 0, dark = false }: { harePoints?: number; dark?: boolean }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth')
    router.refresh()
  }

  return (
    <>
      {/* ── Top mini bar (logo + points) ─────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          background: dark ? 'rgba(26,21,35,0.88)' : 'rgba(254,249,240,0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: dark ? '1px solid rgba(74,222,128,0.12)' : '1px solid rgba(251,146,60,0.13)',
          paddingTop: 'var(--safe-top)',
        }}
      >
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-2.5">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5" style={{ textDecoration: 'none', minHeight: 44, alignItems: 'center' }}>
            <span style={{ fontSize: 22 }}>☀️</span>
            <span
              style={{
                fontFamily: "'M PLUS Rounded 1c', sans-serif",
                fontWeight: 900,
                fontSize: 18,
                background: 'linear-gradient(135deg, #fb923c, #f472b6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              はれる
            </span>
          </Link>

          <div className="flex items-center gap-2">
            {/* Hare Points */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '5px 12px',
                borderRadius: 99,
                background: dark
                  ? 'linear-gradient(135deg,rgba(74,222,128,.15),rgba(56,189,248,.15))'
                  : 'linear-gradient(135deg,rgba(251,146,60,.15),rgba(244,114,182,.15))',
                border: dark ? '1px solid rgba(74,222,128,.3)' : '1px solid rgba(251,146,60,.3)',
                fontFamily: "'M PLUS Rounded 1c', sans-serif",
                fontWeight: 700,
                fontSize: 13,
                color: dark ? '#4ade80' : '#c2410c',
                minHeight: 32,
              }}
            >
              <span>✨</span>
              <span>{harePoints}pt</span>
            </div>

            {/* ログアウトボタン */}
            <button
              onClick={handleLogout}
              style={{
                background: 'transparent',
                border: dark ? '1px solid rgba(74,222,128,.25)' : '1px solid rgba(251,146,60,.2)',
                borderRadius: 99,
                padding: '5px 10px',
                fontSize: 11,
                fontWeight: 700,
                fontFamily: "'M PLUS Rounded 1c', sans-serif",
                color: dark ? '#6abf8c' : '#b08060',
                cursor: 'pointer',
                minHeight: 32,
                whiteSpace: 'nowrap',
              }}
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>

      {/* ── Bottom navigation bar ────────────────────────── */}
      <nav className={`bottom-nav${dark ? ' bottom-nav-dark' : ''}`}>
        <div
          className="max-w-lg mx-auto flex"
          style={{ padding: '6px 12px 0' }}
        >
          {tabs.map(({ href, label, emoji, activeColor, activeBg, borderColor }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                  padding: '8px 4px 10px',
                  borderRadius: 16,
                  textDecoration: 'none',
                  minHeight: 56,
                  transition: 'all 0.18s',
                  background: active ? activeBg : 'transparent',
                  border: active ? `1px solid ${borderColor}` : '1px solid transparent',
                  margin: '0 3px',
                }}
              >
                <span style={{ fontSize: active ? 24 : 20, transition: 'font-size 0.18s', lineHeight: 1 }}>
                  {emoji}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: active ? 800 : 500,
                    fontFamily: "'M PLUS Rounded 1c', sans-serif",
                    color: active ? activeColor : (dark ? '#6abf8c' : '#b08060'),
                    letterSpacing: '0.03em',
                  }}
                >
                  {label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
