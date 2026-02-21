import type { Metadata, Viewport } from "next"
import { Source_Sans_3, Space_Grotesk } from "next/font/google"
import "./globals.css"
import { LayoutShell } from "@/components/layout-shell"
import { Analytics } from "@vercel/analytics/next"

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
  weight: ["300", "400", "500", "600", "700"],
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["500", "600", "700"],
})

export const metadata: Metadata = {
  title: "JobPortal - Find Your Dream Job",
  description:
    "Discover opportunities from fast-growing teams and enterprise leaders. A modern job search experience.",
}

export const viewport: Viewport = {
  themeColor: "#0f1117",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${sourceSans.variable} ${spaceGrotesk.variable} font-sans antialiased`}
      >
        <LayoutShell>{children}</LayoutShell>
        <Analytics />
      </body>
    </html>
  )
}
