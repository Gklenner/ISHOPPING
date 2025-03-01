import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Shoppe - Fashion Store",
  description: "E-Commerce Clothing Fashion Store",
  generator: 'v0.dev'
}

import dynamic from 'next/dynamic'

const ClientLayout = dynamic(() => import('./client-layout'), {
  ssr: false
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <ThemeProvider attribute="class" defaultTheme="light">
            <div className="max-w-[390px] mx-auto min-h-screen bg-white">{children}</div>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}