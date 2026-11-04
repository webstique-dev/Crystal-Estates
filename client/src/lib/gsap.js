import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
  // Ensure ScrollTrigger refreshes properly on font/image load
  ScrollTrigger.config({ limitCallbacks: true })
}

export { gsap, ScrollTrigger }

/**
 * Check if the user prefers reduced motion
 */
export function isReducedMotion() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

