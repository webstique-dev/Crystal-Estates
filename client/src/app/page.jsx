import HeroSection from '../components/sections/HeroSection'
import StatsBar from '../components/sections/StatsBar'
import FeaturedProjectsSection from '../components/sections/FeaturedProjectsSection'
import ServicesOverview from '../components/sections/ServicesOverview'
import WhyChooseUs from '../components/sections/WhyChooseUs'
import EnquirySection from '../components/sections/EnquirySection'
import TestimonialsSection from '../components/TestimonialsSection'

export const metadata = {
  title: 'Crystal Estates | Own Land You Can Trust | ASSETS CREATOR Chennai',
  description:
    'Verified plots and farmland around Chennai with clear titles and complete documentation. CMDA and DTCP approved residential layouts and sandalwood agro-forestry farmland.',
  openGraph: {
    title: 'Crystal Estates | Own Land You Can Trust | ASSETS CREATOR',
    description:
      'Verified plots and farmland around Chennai with clear titles and complete documentation.',
    url: 'https://crystalestates.in',
    siteName: 'Crystal Estates',
    images: [
      {
        url: '/images/vedanthangal.jpg',
        width: 1200,
        height: 630,
        alt: 'Crystal Estates Sandalwood Farm Land Chennai',
      },
    ],
  },
}

export default function HomePage() {
  return (
    <main>
      {/* 1. HeroSection */}
      <HeroSection
        heading="Own Land You Can Trust"
        subtext="Verified plots and farmland around Chennai with clear titles and complete documentation."
      />

      {/* 2. StatsBar */}
      <StatsBar />

      {/* 3. Featured ProjectGrid + ProjectCard */}
      <FeaturedProjectsSection />

      {/* 4. ServicesOverview */}
      <ServicesOverview />

      {/* 5. WhyChooseUs */}
      <WhyChooseUs />

      {/* 6. EnquirySection */}
      <EnquirySection />

      {/* 7. TestimonialsSection */}
      <TestimonialsSection />
    </main>
  )
}
