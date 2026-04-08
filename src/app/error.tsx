'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

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
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 72, marginBottom: 8 }}>⛅</div>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#2d1a10', marginBottom: 8 }}>
        ちょっと雲がかかってる
      </h1>
      <p style={{ fontSize: 14, color: '#7a4a2a', lineHeight: 1.8, marginBottom: 32 }}>
        予期しないエラーが起きたみたい。<br />
        もう一度試してみてください。
      </p>
      <button
        onClick={reset}
        style={{
          padding: '13px 32px',
          borderRadius: 99,
          background: 'linear-gradient(135deg, #ff9a3c, #ff6b00)',
          color: 'white',
          fontWeight: 800,
          fontSize: 15,
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(255,107,0,0.3)',
          fontFamily: "'M PLUS Rounded 1c', sans-serif",
        }}
      >
        🔄 もう一度試す
      </button>
    </div>
  )
}
