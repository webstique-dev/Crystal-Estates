/* Decorative plot-layout illustration (used in place of photos until real images exist).
   `seed` varies the highlighted plot so every card looks slightly different. */
export default function PlotLayout({ seed = 0, rows = 3, cols = 6, className = '' }) {
  const W = 360, H = 190, road = 14, pad = 10
  const cw = (W - pad * 2 - road) / cols
  const ch = (H - pad * 2 - road) / rows
  const hi = (seed * 7 + 3) % (rows * cols)
  const cells = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c
      const x = pad + c * cw + (c >= cols / 2 ? road : 0)
      const y = pad + r * ch + (r >= rows / 2 ? road : 0)
      cells.push(
        <rect key={i} x={x + 2} y={y + 2} width={cw - 4} height={ch - 4} rx="4"
          fill={i === hi ? 'var(--green-500)' : '#fff'}
          stroke={i === hi ? 'var(--green-700)' : '#c9ddd2'} strokeWidth="1.2" />,
      )
    }
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} role="img" aria-label="Plot layout illustration">
      <rect width={W} height={H} rx="14" fill="#e9f5ee" />
      {cells}
      {/* leaf accent */}
      <path d="M322 24c10-9 22-9 28-6-2 9-12 17-28 6Z" fill="var(--green-500)" opacity=".85" />
    </svg>
  )
}
