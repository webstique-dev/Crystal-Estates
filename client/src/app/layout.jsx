import { Montserrat, Playfair_Display } from 'next/font/google'
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
  title: 'Crystal Estates | Farm Lands, Plots & Premium Living in Chennai',
  description:
    'Crystal Estates — Flagship Vedanthangal Sandalwood Farm Land (15 Acres) & approved residential plots in Chennai. Clear titles, transparent documentation, and guided site visits.',
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${montserrat.variable} ${playfair.variable}`}>
      <body>{children}</body>
    </html>
  )
}
