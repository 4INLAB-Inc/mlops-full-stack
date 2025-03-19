import { Metadata } from 'next'
import RootLayoutClient from './RootLayoutClient'
import './globals.css'

export const metadata: Metadata = {
  title: '4INLAB MLOps',
  description: 'MLOps Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  )
}
