'use client'

export default function PageLoader({ dark = false }: { dark?: boolean }) {
  const bg = dark
    ? 'linear-gradient(160deg,#0f1824 0%,#1a1523 50%,#0d1f17 100%)'
    : 'linear-gradient(160deg,#fef9f0 0%,#fff0f5 50%,#f0f4ff 100%)'
  const shimmer = dark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.7)'
  const shimmerBorder = dark ? 'rgba(74,222,128,0.1)' : 'rgba(251,146,60,0.15)'

  return (
    <div
      className="min-h-screen relative overflow-x-hidden flex flex-col"
      style={{ background: bg }}
    >
      {/* Top bar skeleton */}
      <div
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4"
        style={{
          background: dark ? 'rgba(26,21,35,0.88)' : 'rgba(254,249,240,0.88)',
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${shimmerBorder}`,
          height: 52,
        }}
      >
        <div style={{ width: 70, height: 24, borderRadius: 8, background: shimmer }} />
        <div style={{ width: 60, height: 28, borderRadius: 99, background: shimmer }} />
      </div>

      {/* Content skeleton */}
      <main
        className="relative z-10 max-w-lg mx-auto px-4 w-full"
        style={{ paddingTop: 'calc(52px + 24px)', paddingBottom: 80 }}
      >
        {/* Emoji + title */}
        <div className="text-center mb-6">
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: shimmer, margin: '0 auto 12px' }} />
          <div style={{ width: 160, height: 28, borderRadius: 8, background: shimmer, margin: '0 auto 8px' }} />
          <div style={{ width: 200, height: 16, borderRadius: 6, background: shimmer, margin: '0 auto' }} />
        </div>

        {/* Card skeleton */}
        <div
          className="rounded-3xl p-5 mb-4"
          style={{ background: shimmer, border: `1px solid ${shimmerBorder}`, minHeight: 180 }}
        >
          <div style={{ width: '60%', height: 18, borderRadius: 6, background: shimmerBorder, marginBottom: 16 }} />
          <div style={{ width: '100%', height: 14, borderRadius: 5, background: shimmerBorder, marginBottom: 10 }} />
          <div style={{ width: '80%', height: 14, borderRadius: 5, background: shimmerBorder, marginBottom: 10 }} />
          <div style={{ width: '90%', height: 14, borderRadius: 5, background: shimmerBorder }} />
        </div>

        {/* Two small cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl" style={{ background: shimmer, border: `1px solid ${shimmerBorder}`, height: 88 }} />
          <div className="rounded-2xl" style={{ background: shimmer, border: `1px solid ${shimmerBorder}`, height: 88 }} />
        </div>
      </main>

      {/* Bottom nav skeleton */}
      <div
        className="fixed bottom-0 left-0 right-0 flex justify-around items-center px-4"
        style={{
          background: dark ? 'rgba(26,21,35,0.95)' : 'rgba(254,249,240,0.95)',
          borderTop: `1px solid ${shimmerBorder}`,
          height: 64,
          backdropFilter: 'blur(20px)',
        }}
      >
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{ width: 48, height: 40, borderRadius: 12, background: shimmer }} />
        ))}
      </div>
    </div>
  )
}
