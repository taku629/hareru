'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/',          label: '朝',    emoji: '☀️', activeColor: '#ea580c', activeBg: 'rgba(251,146,60,0.15)', borderColor: 'rgba(251,146,60,0.3)' },
  { href: '/moyamoya', label: '日中',  emoji: '🌤', activeColor: '#4338ca', activeBg: 'rgba(129,140,248,0.15)', borderColor: 'rgba(129,140,248,0.3)' },
  { href: '/yokatta',  label: '夜',    emoji: '🌙', activeColor: '#16a34a', activeBg: 'rgba(74,222,128,0.15)',  borderColor: 'rgba(74,222,128,0.3)'  },
  { href: '/stats',    label: '記録',  emoji: '📊', activeColor: '#c2410c', activeBg: 'rgba(251,146,60,0.15)', borderColor: 'rgba(251,146,60,0.3)'  },
  { href: '/settings', label: '設定',  emoji: '⚙️', activeColor: '#7c3aed', activeBg: 'rgba(167,139,250,0.15)', borderColor: 'rgba(167,139,250,0.3)' },
]

interface HeaderProps {
  harePoints?: number
  dark?: boolean
  displayName?: string | null
  avatarUrl?: string | null
}

export default function Header({ harePoints = 0, dark = false, displayName, avatarUrl }: HeaderProps) {
  const pathname = usePathname()

  return (
    <>
      {/* ── Top bar ──────────────────────────────────── */}
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
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, minHeight: 44 }}>
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

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Hare points badge */}
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

            {/* Avatar / settings link */}
            <Link
              href="/settings"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
                borderRadius: '50%',
                textDecoration: 'none',
                overflow: 'hidden',
                border: dark ? '2px solid rgba(74,222,128,.35)' : '2px solid rgba(251,146,60,.35)',
                flexShrink: 0,
              }}
            >
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(135deg, #fb923c, #f472b6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                    color: 'white',
                    fontWeight: 800,
                    fontFamily: "'M PLUS Rounded 1c', sans-serif",
                  }}
                >
                  {displayName?.[0]?.toUpperCase() ?? '☀'}
                </div>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* ── Bottom navigation ────────────────────────── */}
      <nav className={`bottom-nav${dark ? ' bottom-nav-dark' : ''}`}>
        <div className="max-w-lg mx-auto flex" style={{ padding: '6px 8px 0' }}>
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
                  padding: '8px 2px 10px',
                  borderRadius: 14,
                  textDecoration: 'none',
                  minHeight: 56,
                  transition: 'all 0.18s',
                  background: active ? activeBg : 'transparent',
                  border: active ? `1px solid ${borderColor}` : '1px solid transparent',
                  margin: '0 2px',
                }}
              >
                <span style={{ fontSize: active ? 22 : 19, transition: 'font-size 0.18s', lineHeight: 1 }}>
                  {emoji}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: active ? 800 : 500,
                    fontFamily: "'M PLUS Rounded 1c', sans-serif",
                    color: active ? activeColor : (dark ? '#6abf8c' : '#b08060'),
                    letterSpacing: '0.02em',
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
