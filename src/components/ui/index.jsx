import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, isReducedMotion } from '../../lib/gsap'
export { LeafDecor } from './LeafDecor'

/* Reusable layout primitives & GSAP-powered animated building blocks */

export function Container({ children, className = '' }) {
  return <div className={`container ${className}`}>{children}</div>
}

export function Section({ id, variant = '', children, ...rest }) {
  return (
    <section id={id} className={`section ${variant ? `section--${variant}` : ''}`} {...rest}>
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

/* GSAP-powered ScrollTrigger Reveal Component */
export function Reveal({ children, delay = 0, y = 20, className = '', ...rest }) {
  const ref = useRef(null)

  useGSAP(
    () => {
      if (isReducedMotion() || !ref.current) return
      gsap.from(ref.current, {
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        y,
        opacity: 0,
        duration: 0.7,
        delay,
        ease: 'power3.out',
      })
    },
    { scope: ref },
  )

  return (
    <div ref={ref} className={className} {...rest}>
      {children}
    </div>
  )
}

/* GSAP-powered Word-by-Word SplitText Component */
export function SplitText({ text, className = '', delay = 0.04 }) {
  const ref = useRef(null)
  const words = text.split(' ')

  useGSAP(
    () => {
      if (isReducedMotion() || !ref.current) return
      const wordEls = ref.current.querySelectorAll('.split-word')
      if (!wordEls.length) return

      gsap.from(wordEls, {
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        y: 18,
        opacity: 0,
        stagger: delay,
        duration: 0.6,
        ease: 'power3.out',
      })
    },
    { scope: ref },
  )

  return (
    <span ref={ref} className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} className="split-word" style={{ display: 'inline-block', marginRight: '0.25em' }}>
          {w}
        </span>
      ))}
    </span>
  )
}

/* GSAP-powered ScrollTrigger CountUp Component */
export function CountUp({ to, suffix = '' }) {
  const ref = useRef(null)

  useGSAP(
    () => {
      if (isReducedMotion() || !ref.current) {
        if (ref.current) ref.current.textContent = Number(to).toLocaleString('en-IN') + suffix
        return
      }

      const counter = { val: 0 }
      gsap.to(counter, {
        val: to,
        duration: 1.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        onUpdate: () => {
          if (ref.current) {
            ref.current.textContent = Math.round(counter.val).toLocaleString('en-IN') + suffix
          }
        },
      })
    },
    { scope: ref },
  )

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

/* Infinite scrolling strip with GSAP ScrollTrigger fade-in */
export function Marquee({ items }) {
  const marqueeRef = useRef(null)
  const doubled = [...items, ...items]

  useGSAP(
    () => {
      if (isReducedMotion() || !marqueeRef.current) return
      gsap.from(marqueeRef.current, {
        scrollTrigger: {
          trigger: marqueeRef.current,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
        opacity: 0,
        y: 15,
        duration: 0.6,
        ease: 'power2.out',
      })
    },
    { scope: marqueeRef },
  )

  return (
    <div className="marquee" aria-hidden="true" ref={marqueeRef}>
      <div className="marquee__track">
        {doubled.map((it, i) => (
          <span className="marquee__item" key={i}>{it}</span>
        ))}
      </div>
    </div>
  )
}
