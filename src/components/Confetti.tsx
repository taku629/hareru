'use client'

import { useEffect, useState } from 'react'

interface Particle {
  id: number
  x: number
  size: number
  delay: number
  emoji: string
}

const EMOJIS = ['✨','🌟','⭐','💫','🎉','🌸','🌈','☀️']

export default function Confetti({ active }: { active: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    if (!active) { setParticles([]); return }
    const ps: Particle[] = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: 5 + (i * 5.5) % 90,
      size: 14 + (i % 3) * 6,
      delay: (i % 8) * 0.12,
      emoji: EMOJIS[i % EMOJIS.length],
    }))
    setParticles(ps)
    const t = setTimeout(() => setParticles([]), 2800)
    return () => clearTimeout(t)
  }, [active])

  if (!particles.length) return null

  return (
    <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:9999, overflow:'hidden' }}>
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position:'absolute',
            left:`${p.x}%`,
            top: -24,
            fontSize: p.size,
            animation:`confetti-fall 2s ease-in ${p.delay}s forwards`,
          }}
        >
          {p.emoji}
        </div>
      ))}
    </div>
  )
}
