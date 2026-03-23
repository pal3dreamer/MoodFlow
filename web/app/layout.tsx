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
    <html lang="en" className="dark">
      <body className="bg-white text-black dark:bg-black dark:text-white transition-colors duration-300">
        {children}
      </body>
    </html>
  )
}
