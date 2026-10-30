'use client'

import { useState } from 'react'
import { ShieldCheck, BadgeCheck, MapPin, Landmark, Handshake } from 'lucide-react'
import { Marquee } from '../components/ui'
import Navbar from '../components/sections/Navbar'
import Hero from '../components/sections/Hero'
import About from '../components/sections/About'
import Team from '../components/sections/Team'
import Plots from '../components/sections/Plots'
import StatsBand from '../components/sections/StatsBand'
import Features from '../components/sections/Features'
import Process from '../components/sections/Process'
import Testimonials from '../components/sections/Testimonials'
import Faq from '../components/sections/Faq'
import Contact from '../components/sections/Contact'
import Footer from '../components/sections/Footer'

const defaultFilters = { location: '', size: 0, budget: 0 }

const strip = [
  [ShieldCheck, 'Clear titles'],
  [BadgeCheck, 'DTCP / CMDA approved'],
  [MapPin, 'Prime West Chennai'],
  [Landmark, 'Bank-loan friendly'],
  [Handshake, 'Guided site visits'],
].map(([Icon, label], idx) => (
  <span key={idx} className="marquee-badge">
    <Icon size={18} /> {label}
  </span>
))

export default function HomePage() {
  const [filters, setFilters] = useState(defaultFilters)
  const [selectedPlot, setSelectedPlot] = useState(null)

  const enquire = (plot) => {
    setSelectedPlot(plot)
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <Navbar />
      <main>
        <Hero onSearch={setFilters} />
        <Marquee items={strip} />
        <About />
        <Team />
        <Plots filters={filters} onEnquire={enquire} onReset={() => setFilters(defaultFilters)} />
        <StatsBand />
        <Features />
        <Process />
        <Testimonials />
        <Faq />
        <Contact selectedPlot={selectedPlot} />
      </main>
      <Footer />
    </>
  )
}

