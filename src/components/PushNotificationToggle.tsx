'use client'

import { useState, useEffect } from 'react'

export default function PushNotificationToggle() {
  const [supported, setSupported] = useState(false)
  const [enabled, setEnabled] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setSupported(true)
      navigator.serviceWorker.ready.then(reg => {
        reg.pushManager.getSubscription().then(sub => {
          setEnabled(!!sub)
        })
      })
    }
  }, [])

  async function handleToggle() {
    setLoading(true)
    try {
      const reg = await navigator.serviceWorker.ready

      if (enabled) {
        const sub = await reg.pushManager.getSubscription()
        if (sub) await sub.unsubscribe()
        await fetch('/api/push/subscribe', { method: 'DELETE' })
        setEnabled(false)
      } else {
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') return

        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ''
          ),
        })
        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sub),
        })
        setEnabled(true)
      }
    } finally {
      setLoading(false)
    }
  }

  if (!supported) return null

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 22 }}>🔔</span>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#2d1a10', fontFamily: "'M PLUS Rounded 1c', sans-serif" }}>
            プッシュ通知
          </div>
          <div style={{ fontSize: 12, color: '#b08060', marginTop: 1 }}>
            朝8時・夜9時にリマインダーが届く
          </div>
        </div>
      </div>
      <button
        onClick={handleToggle}
        disabled={loading}
        style={{
          width: 52,
          height: 30,
          borderRadius: 15,
          border: 'none',
          background: enabled ? 'linear-gradient(135deg, #fb923c, #f472b6)' : '#e5e5e5',
          cursor: loading ? 'not-allowed' : 'pointer',
          position: 'relative',
          transition: 'background .25s',
          flexShrink: 0,
        }}
        aria-checked={enabled}
        role="switch"
      >
        <span
          style={{
            position: 'absolute',
            top: 3,
            left: enabled ? 25 : 3,
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: 'white',
            boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
            transition: 'left .25s',
          }}
        />
      </button>
    </div>
  )
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i)
  return outputArray
}
