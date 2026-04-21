'use client'

import { useEffect, useRef, useState, createContext, useContext, useCallback } from 'react'

type ToastType = 'success' | 'error' | 'info'

interface ToastItem {
  id: number
  msg: string
  type: ToastType
}

interface ToastContextValue {
  showToast: (msg: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const nextId = useRef(0)

  const showToast = useCallback((msg: string, type: ToastType = 'info') => {
    const id = nextId.current++
    setToasts(prev => [...prev, { id, msg, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{ position: 'fixed', top: 72, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
        {toasts.map(t => (
          <div
            key={t.id}
            style={{
              background: t.type === 'error' ? '#ef4444' : t.type === 'success' ? '#22c55e' : '#64748b',
              color: 'white',
              padding: '10px 22px',
              borderRadius: 99,
              fontSize: 14,
              fontWeight: 700,
              boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
              whiteSpace: 'nowrap',
              animation: 'fade-in .2s ease',
            }}
          >
            {t.msg}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
