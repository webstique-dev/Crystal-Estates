import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, isReducedMotion } from '../../lib/gsap'
export { LeafDecor } from './LeafDecor'

/* Reusable layout primitives & GSAP-powered animated building blocks */

export function Container({ children, className = '' }) {
  return <div className={`container ${className}`}>{children}</div>
}

export function Section({ id, variant = '', className = '', children, ...rest }) {
  const cls = ['section', variant && `section--${variant}`, className].filter(Boolean).join(' ')
  return (
    <section id={id} className={cls} {...rest}>
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

export function WhatsAppIcon({ size = 24, className = '', ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
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
