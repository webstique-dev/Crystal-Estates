import HeroSection from '../components/sections/HeroSection'
import About from '../components/sections/About'
import FeaturedProjectsSection from '../components/sections/FeaturedProjectsSection'
import PropertyCategoriesSection from '../components/sections/PropertyCategoriesSection'
import WhyChooseUs from '../components/sections/WhyChooseUs'
import Process from '../components/sections/Process'
import TestimonialsSection from '../components/TestimonialsSection'
import LatestUpdatesSection from '../components/sections/LatestUpdatesSection'
import EnquirySection from '../components/sections/EnquirySection'
import ContactInfoSection from '../components/sections/ContactInfoSection'

export const metadata = {
  title: 'Crystal Estates | Creating Assets. Building Trust. Securing Your Future.',
  description:
    'Discover premium residential plots, agricultural lands and valuable land investment opportunities around Chennai with Crystal Estates — ASSETS CREATOR.',
  openGraph: {
    title: 'Crystal Estates | Creating Assets. Building Trust. Securing Your Future.',
    description:
      'Discover premium residential plots, agricultural lands and valuable land investment opportunities around Chennai with Crystal Estates.',
    url: 'https://crystalestates.in',
    siteName: 'Crystal Estates',
    images: [
      {
        url: '/images/vedanthangal.jpg',
        width: 1200,
        height: 630,
        alt: 'Crystal Estates Chennai',
      },
    ],
  },
}

export default function HomePage() {
  return (
    <main>
      {/* Hero banner */}
      <HeroSection
        heading="Creating Assets. Building Trust. Securing Your Future."
        subheading="Discover premium residential plots, agricultural lands and valuable land investment opportunities with Crystal Estates."
      />

      {/* 1. About Crystal Estates */}
      <About />

      {/* 2. Featured projects */}
      <FeaturedProjectsSection
        title="Featured Projects"
        subtitle="CMDA & DTCP approved plots and managed sandalwood farm lands across prime Chennai corridors."
      />

      {/* 3. Property categories */}
      <PropertyCategoriesSection
        title="Property Categories"
        subtitle="Explore diversified land opportunities tailored for residential living, agro-forestry, and high-yield capital appreciation."
      />

      {/* 4. Why choose Crystal Estates? */}
      <WhyChooseUs
        title="Why Choose Crystal Estates?"
        subtitle="Six core pillars that make us Chennai’s most trusted land and plot asset creator."
      />

      {/* 5. Our business process */}
      <Process
        title="Our Business Process"
        text="A transparent, hassle-free path to owning your approved residential plot and farmland asset in Chennai."
      />

      {/* 6. Customer testimonials */}
      <TestimonialsSection
        title="Customer Testimonials"
        subtitle="Authentic stories and reviews from land owners and investors across Chennai."
      />

      {/* 7. Latest property updates */}
      <LatestUpdatesSection
        title="Latest Property Updates"
        subtitle="Market trends, regulatory updates, CMDA/DTCP insights, and land appreciation analysis."
      />

      {/* 8. Enquiry form */}
      <EnquirySection
        title="Enquiry Form"
        subtitle="Connect with our land advisors for clear-title documentation, site visits, and transparent pricing."
      />

      {/* 9. Contact information */}
      <ContactInfoSection
        title="Contact Information"
        subtitle="Visit our registered office in Valasaravakkam, Chennai or schedule a private site inspection tour with our land advisors."
      />
    </main>
  )
}
