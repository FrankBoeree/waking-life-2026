import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { FavoritesProvider } from "@/contexts/favorites-context"
import { OfflineInitializer } from "@/components/offline-initializer"
import { FESTIVAL_CONFIG } from "@/lib/festival-config"
import { structuredData } from "@/lib/structured-data"

const inter = Inter({ subsets: ["latin"] })

const siteUrl = new URL(FESTIVAL_CONFIG.siteUrl)
const ogImagePath = "/dekmantel-og.svg"

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: FESTIVAL_CONFIG.appTitle,
  description: FESTIVAL_CONFIG.description,
  applicationName: FESTIVAL_CONFIG.manifestName,
  keywords: [...FESTIVAL_CONFIG.seoKeywords],
  manifest: "/manifest.json",
  alternates: {
    canonical: "/",
    types: {
      "text/markdown": "/lineup-summary.md",
    },
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: FESTIVAL_CONFIG.title,
    title: FESTIVAL_CONFIG.appTitle,
    description: FESTIVAL_CONFIG.description,
    images: [
      {
        url: ogImagePath,
        width: 1200,
        height: 630,
        alt: "Dekmantel Festival 2026 unofficial timetable and lineup",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: FESTIVAL_CONFIG.appTitle,
    description: FESTIVAL_CONFIG.description,
    images: [ogImagePath],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: FESTIVAL_CONFIG.title,
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#E63946",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="llms-txt" href="/llms.txt" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={FESTIVAL_CONFIG.title} />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icon-192x192.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-2CQJY9XWXS"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-2CQJY9XWXS');
            `
          }}
        />
      </head>
      <body className={inter.className}>
        <noscript>
          Unofficial Dekmantel Festival 2026 timetable companion ({FESTIVAL_CONFIG.officialDateRange}).
          Full schedule summary: {FESTIVAL_CONFIG.siteUrl}/lineup-summary.md
        </noscript>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <FavoritesProvider>
            <OfflineInitializer />
            {children}
          </FavoritesProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
