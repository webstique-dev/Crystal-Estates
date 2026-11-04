// Subtle, elegant leaf-themed SVG background elements
// Designed to complement the green brand theme without cluttering text or content.

export function LeafDecor({ variant = 'branch', className = '', style = {}, opacity = 0.06 }) {
  if (variant === 'branch') {
    return (
      <svg
        className={`leaf-decor leaf-decor--branch ${className}`}
        style={{ opacity, ...style }}
        viewBox="0 0 320 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M30 290C90 270 170 210 240 80M240 80C260 40 285 25 295 25C295 40 280 65 240 80ZM240 80C210 95 180 100 160 90C165 75 185 70 240 80ZM185 145C145 155 120 150 105 135C115 125 140 125 185 145ZM135 210C95 220 70 215 60 195C70 185 95 190 135 210ZM205 170C235 155 255 160 265 175C250 185 225 180 205 170Z"
          stroke="var(--green-500)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M240 80C260 40 285 25 295 25C295 40 280 65 240 80Z"
          fill="var(--green-500)"
          fillOpacity="0.3"
        />
        <path
          d="M185 145C145 155 120 150 105 135C115 125 140 125 185 145Z"
          fill="var(--green-500)"
          fillOpacity="0.25"
        />
        <path
          d="M205 170C235 155 255 160 265 175C250 185 225 180 205 170Z"
          fill="var(--green-500)"
          fillOpacity="0.25"
        />
      </svg>
    )
  }

  if (variant === 'single') {
    return (
      <svg
        className={`leaf-decor leaf-decor--single ${className}`}
        style={{ opacity, ...style }}
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M20 140C30 90 60 40 140 20C120 60 100 110 20 140Z"
          fill="var(--green-500)"
          fillOpacity="0.3"
          stroke="var(--green-500)"
          strokeWidth="2.5"
        />
        <path
          d="M20 140C65 100 95 65 140 20"
          stroke="var(--green-600)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    )
  }

  // Botanical palm / laurel arc
  return (
    <svg
      className={`leaf-decor leaf-decor--laurel ${className}`}
      style={{ opacity, ...style }}
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M30 210C60 160 110 80 200 40M200 40C190 60 170 70 150 65M200 40C205 60 195 80 180 90M140 100C125 110 105 110 95 95M140 100C150 115 145 130 130 140M90 155C75 165 55 165 45 150M90 155C100 170 95 185 80 195"
        stroke="var(--green-500)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}

