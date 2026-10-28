import { useEffect, useRef } from 'react'
import { motion, useInView, animate } from 'framer-motion'
export { LeafDecor } from './LeafDecor'

/* Small, reusable building blocks. React Bits–style effects:
   Reveal, SplitText, CountUp, SpotlightCard, Marquee. */

export function Container({ children, className = '' }) {
  return <div className={`container ${className}`}>{children}</div>
}

export function Section({ id, variant = '', children }) {
  return (
    <section id={id} className={`section ${variant ? `section--${variant}` : ''}`}>
      <Container>{children}</Container>
    </section>
  )
}

export function SectionHeading({ eyebrow, title, text, center = false }) {
  return (
    <div className={`heading ${center ? 'heading--center' : ''}`}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  )
}

export function Button({ as: Tag = 'button', variant = 'primary', size, block, className = '', children, ...rest }) {
  const cls = ['btn', `btn--${variant}`, size && `btn--${size}`, block && 'btn--block', className].filter(Boolean).join(' ')
  return <Tag className={cls} {...rest}>{children}</Tag>
}

export function Badge({ tone = '', children }) {
  return <span className={`badge ${tone ? `badge--${tone}` : ''}`}>{children}</span>
}

export function Field({ label, children }) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
    </div>
  )
}

/* Fade + slide up when scrolled into view */
export function Reveal({ children, delay = 0, y = 16, className = '', ...rest }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.05 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

/* Word-by-word headline animation */
export function SplitText({ text, className = '', delay = 0.05 }) {
  const words = text.split(' ')
  return (
    <span className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom' }}>
          <motion.span
            style={{ display: 'inline-block' }}
            initial={{ y: '110%' }}
            animate={{ y: 0 }}
            transition={{ duration: 0.7, delay: i * delay, ease: [0.22, 1, 0.36, 1] }}
          >
            {w}&nbsp;
          </motion.span>
        </span>
      ))}
    </span>
  )
}

/* Number that counts up when visible */
export function CountUp({ to, suffix = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  useEffect(() => {
    if (!inView || !ref.current) return
    const controls = animate(0, to, {
      duration: 1.8,
      ease: 'easeOut',
      onUpdate: (v) => { if (ref.current) ref.current.textContent = Math.round(v).toLocaleString('en-IN') + suffix },
    })
    return () => controls.stop()
  }, [inView, to, suffix])
  return <span ref={ref}>0{suffix}</span>
}

/* Card with a cursor-following green glow */
export function SpotlightCard({ children, className = '' }) {
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--x', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--y', `${e.clientY - r.top}px`)
  }
  return (
    <div className={`spot ${className}`} onMouseMove={onMove}>
      {children}
    </div>
  )
}

/* Infinite scrolling strip */
export function Marquee({ items }) {
  const doubled = [...items, ...items]
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee__track">
        {doubled.map((it, i) => (
          <span className="marquee__item" key={i}>{it}</span>
        ))}
      </div>
    </div>
  )
}
