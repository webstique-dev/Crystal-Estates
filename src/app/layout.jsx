import { Inter, Cormorant_Garamond } from 'next/font/google'
import '../index.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
})

export const metadata = {
  title: 'Crystal Estates | Plots for Sale in Chennai',
  description:
    'Crystal Estates — approved residential plots in Chennai. Clear titles, transparent pricing, and guided site visits.',
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
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`}>
      <body>{children}</body>
    </html>
  )
}
