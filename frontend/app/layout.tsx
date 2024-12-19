import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import {ThemeProvider} from '@/components/providers/theme-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Notion',
  description: 'The connected workspace where better, faster work happens.',
  icons:{
    icon:[
      {
        url: '/logo.svg',
        href: '/logo.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        media: '(prefers-color-scheme: light)'
      },
      {
        url: '/logo-dark.svg',
        href: '/logo-dark.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        media: '(prefers-color-scheme: dark)',
      }
    ]
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="jotion-theme"
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
