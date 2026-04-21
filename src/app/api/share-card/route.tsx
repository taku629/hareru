import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const days = searchParams.get('days') ?? '7'
  const name = searchParams.get('name') ?? 'あなた'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #fb923c 0%, #f472b6 50%, #a78bfa 100%)',
          fontFamily: 'serif',
        }}
      >
        {/* Card */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.15)',
            borderRadius: 32,
            padding: '48px 64px',
            border: '2px solid rgba(255,255,255,0.35)',
          }}
        >
          <div style={{ fontSize: 72, marginBottom: 16, lineHeight: 1 }}>☀️</div>
          <div
            style={{
              fontSize: 52,
              fontWeight: 900,
              color: 'white',
              marginBottom: 12,
              textShadow: '0 2px 12px rgba(0,0,0,0.2)',
              letterSpacing: '-1px',
            }}
          >
            {days}日間晴れ続けました
          </div>
          <div
            style={{
              fontSize: 28,
              color: 'rgba(255,255,255,0.9)',
              marginBottom: 32,
            }}
          >
            {name}さんのはれる記録
          </div>
          <div
            style={{
              fontSize: 20,
              color: 'rgba(255,255,255,0.75)',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: 99,
              padding: '8px 24px',
            }}
          >
            #Hareru #はれる #毎日晴れ
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
