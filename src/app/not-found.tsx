import Link from 'next/link'

export default function NotFound() {
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
      <div style={{ fontSize: 72, marginBottom: 8, animation: 'float 4s ease-in-out infinite' }}>
        🌤
      </div>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#2d1a10', marginBottom: 8 }}>
        ページが見つからないよ
      </h1>
      <p style={{ fontSize: 14, color: '#7a4a2a', lineHeight: 1.8, marginBottom: 32 }}>
        このページは存在しないか、<br />移動してしまったみたい。
      </p>
      <Link
        href="/"
        style={{
          padding: '13px 32px',
          borderRadius: 99,
          background: 'linear-gradient(135deg, #ff9a3c, #ff6b00)',
          color: 'white',
          fontWeight: 800,
          fontSize: 15,
          textDecoration: 'none',
          boxShadow: '0 4px 16px rgba(255,107,0,0.3)',
        }}
      >
        ☀️ トップに戻る
      </Link>
    </div>
  )
}
