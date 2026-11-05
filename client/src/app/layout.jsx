import { Montserrat, Playfair_Display } from 'next/font/google'
import Header from '../components/sections/Header'
import Footer from '../components/sections/Footer'
import '../index.css'

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-montserrat',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://crystalestates.in'),
  title: {
    default: 'Crystal Estates | Assets Creator — Land & Plot Sales in Chennai',
    template: '%s | Crystal Estates — Assets Creator',
  },
  description:
  'Crystal Estates — ASSETS CREATOR. Clear-titled residential plots, agricultural & sandalwood farm land, individual plots, and bulk land across Chennai & Kanchipuram. 100% legal verification and guided site visits.',
  keywords: [
    'plots for sale in chennai',
    'residential plots chennai',
    'farm land chennai',
    'sandalwood farmland vedanthangal',
    'dtcp approved plots chennai',
    'cmda approved plots kolapakkam',
    'clear title land chennai',
    'land purchase and resale chennai',
    'crystal estates assets creator',
    'valasaravakkam plots office',
  ],
  authors: [{ name: 'Crystal Estates' }],
  creator: 'Crystal Estates',
  publisher: 'Crystal Estates',
  formatDetection: {
    telephone: true,
    address: true,
    email: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://crystalestates.in',
    siteName: 'Crystal Estates',
    title: 'Crystal Estates | Assets Creator — Land & Plot Sales in Chennai',
    description:
      'Clear-titled residential plots, agricultural & sandalwood farm land, individual plots, and bulk land across Chennai. 100% legal verification.',
    images: [
      {
        url: '/images/vedanthangal.jpg',
        width: 1200,
        height: 630,
        alt: 'Crystal Estates — Assets Creator Chennai',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Crystal Estates | Assets Creator — Land & Plot Sales in Chennai',
    description: 'Clear-titled residential plots and sandalwood farm land across Chennai.',
    images: ['/images/vedanthangal.jpg'],
  },
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

const realEstateAgentJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'RealEstateAgent',
  name: 'Crystal Estates',
  alternateName: 'Crystal Estates Chennai',
  slogan: 'ASSETS CREATOR',
  description:
    "Chennai's trusted land asset creator. Specializing exclusively in clear-titled residential plots, CMDA & DTCP approved layouts, and managed sandalwood farm land.",
  url: 'https://crystalestates.in',
  logo: 'https://crystalestates.in/logo.png',
  image: 'https://crystalestates.in/images/vedanthangal.jpg',
  telephone: '+919444000000',
  email: 'info@crystalestates.in',
  priceRange: '₹ 36 Lakhs – ₹ 1.5 Crores',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'No. 9, A.K.R. Nagar Main Road, Crystal Tower, Ground Floor A, Valasaravakkam',
    addressLocality: 'Chennai',
    addressRegion: 'Tamil Nadu',
    postalCode: '600087',
    addressCountry: 'IN',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 13.0418,
    longitude: 80.1742,
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '09:30',
      closes: '19:00',
    },
  ],
  areaServed: [
    { '@type': 'City', name: 'Chennai' },
    { '@type': 'AdministrativeArea', name: 'Kanchipuram' },
    { '@type': 'AdministrativeArea', name: 'Chengalpattu' },
    { '@type': 'State', name: 'Tamil Nadu' },
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Land & Plotted Assets',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Product',
          name: 'CMDA & DTCP Approved Residential Plots',
          description: 'Ready-to-register individual residential plots in Chennai corridors.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Product',
          name: 'Managed Sandalwood Farmland',
          description: '15-Acre flagship agro-forestry managed sandalwood land at Vedanthangal.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Product',
          name: 'Land Purchase & Resale Advisory',
          description: 'Clear-title land acquisition and structured liquidation for landowners.',
        },
      },
    ],
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${montserrat.variable} ${playfair.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(realEstateAgentJsonLd) }}
        />
      </head>
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  )
}
