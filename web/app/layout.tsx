import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MoodFlow - AI-Powered Productivity',
  description: 'Transform your workflow with AI-powered analysis and insights',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
