import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-background" suppressHydrationWarning>
      <head>
        <title>OMR Sheet Generator</title>
        <meta name="description" content="Generate customizable OMR sheets for exams and surveys" />
      </head>
      <body className={`${inter.className} dark`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

export const metadata = {
  title: "OMR Sheet Generator | Assessment Operations",
  description: "Create, print, scan, and analyze customizable OMR sheets.",
  generator: "v0.dev",
}
