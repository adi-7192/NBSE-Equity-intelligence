import type { Metadata } from 'next'
import { Manrope } from 'next/font/google'
import { JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
})

export const metadata: Metadata = {
  title: 'NSE/BSE Equity Research Intelligence',
  description:
    'Weekly investment intelligence for Indian stock market — event alerts, macro pulse, sector rankings, and research-backed stock picks for NSE/BSE Large & Mid cap stocks.',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${manrope.variable} ${jetbrainsMono.variable} dark`}>
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
