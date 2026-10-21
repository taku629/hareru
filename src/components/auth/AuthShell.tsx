import type { CSSProperties, ReactNode } from 'react'

type AuthShellProps = {
  icon: ReactNode
  title: string
  subtitle: ReactNode
  children: ReactNode
  titleSize?: number
  gradient?: string
  decorations?: boolean
  footer?: ReactNode
}

export const authInputStyle: CSSProperties = {
  background: 'rgba(255,249,240,0.9)',
  border: '1.5px solid rgba(251,146,60,0.2)',
  color: '#2d1a10',
  fontSize: 15,
  fontFamily: "'Zen Maru Gothic', sans-serif",
  outline: 'none',
  minHeight: 48,
}

export const authLabelStyle: CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 700,
  color: '#a87c60',
  marginBottom: 6,
}

export const authErrorStyle: CSSProperties = {
  background: 'rgba(244,63,94,0.08)',
  border: '1px solid rgba(244,63,94,0.2)',
  color: '#be123c',
  fontSize: 13,
}

export const authSubmitStyle: CSSProperties = {
  fontFamily: "'M PLUS Rounded 1c', sans-serif",
  fontSize: 15,
  padding: '14px',
  border: 'none',
  boxShadow: '0 8px 28px rgba(251,146,60,0.35)',
  minHeight: 52,
}

export default function AuthShell({
  icon,
  title,
  subtitle,
  children,
  titleSize = 24,
  gradient = 'linear-gradient(135deg,#fb923c,#f472b6)',
  decorations = false,
  footer,
}: AuthShellProps) {
  const outerClassName = decorations
    ? 'min-h-screen relative overflow-x-hidden flex items-center justify-center'
    : 'min-h-screen flex items-center justify-center px-5'
  const innerClassName = decorations ? 'relative z-10 w-full max-w-sm mx-auto px-5 py-10' : ''
  const innerStyle: CSSProperties = decorations
    ? { minHeight: '100dvh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }
    : { width: '100%', maxWidth: 360 }

  return (
    <div
      className={outerClassName}
      style={{ background: 'linear-gradient(160deg,#fef9f0 0%,#fff0f5 50%,#f0f4ff 100%)' }}
    >
      {decorations && (
        <>
          <div style={{ position: 'fixed', width: 260, height: 260, borderRadius: '50%', filter: 'blur(80px)', opacity: .25, pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(circle,#fb923c,transparent)', top: -80, left: -80, animation: 'float 8s ease-in-out infinite' }} />
          <div style={{ position: 'fixed', width: 220, height: 220, borderRadius: '50%', filter: 'blur(80px)', opacity: .2, pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(circle,#f472b6,transparent)', bottom: -60, right: -60, animation: 'float 10s ease-in-out infinite reverse' }} />
          <div style={{ position: 'fixed', width: 180, height: 180, borderRadius: '50%', filter: 'blur(70px)', opacity: .18, pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(circle,#818cf8,transparent)', top: '40%', right: '10%', animation: 'float 12s ease-in-out infinite 2s' }} />
        </>
      )}

      <div className={innerClassName} style={innerStyle}>
        <div className="text-center mb-8">
          <p style={{ fontSize: decorations ? 56 : 48, marginBottom: 8, animation: 'float 4s ease-in-out infinite', lineHeight: 1 }}>{icon}</p>
          <h1
            className="font-black mb-2"
            style={{
              fontFamily: "'M PLUS Rounded 1c', sans-serif",
              fontSize: titleSize,
              background: gradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {title}
          </h1>
          <p style={{ color: '#a87c60', fontSize: 13, lineHeight: decorations ? 1.7 : undefined }}>{subtitle}</p>
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
          {children}
        </div>

        {footer && (
          <p className="text-center mt-6" style={{ color: '#c9a88e', fontSize: 11, lineHeight: 1.9 }}>
            {footer}
          </p>
        )}
      </div>
    </div>
  )
}
