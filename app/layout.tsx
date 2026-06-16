import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { FavoritesProvider } from "@/contexts/favorites-context"
import { OfflineInitializer } from "@/components/offline-initializer"
import { GoogleAnalytics } from "@/components/google-analytics"
import { FESTIVAL_CONFIG } from "@/lib/festival-config"

const inter = Inter({ subsets: ["latin"] })

const siteUrl = new URL(FESTIVAL_CONFIG.siteUrl)

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: FESTIVAL_CONFIG.appTitle,
  description: FESTIVAL_CONFIG.description,
  applicationName: FESTIVAL_CONFIG.manifestName,
  keywords: [
    "Waking Life 2026",
    "Waking Life timetable",
    "Waking Life lineup",
    "Waking Life festival 2026",
    "Waking Life schedule",
  ],
  manifest: "/manifest.json",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: FESTIVAL_CONFIG.title,
    title: FESTIVAL_CONFIG.appTitle,
    description: FESTIVAL_CONFIG.description,
    images: [
      {
        url: "/waking-life-background.jpg",
        width: 1200,
        height: 630,
        alt: "Waking Life 2026 timetable and lineup",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: FESTIVAL_CONFIG.appTitle,
    description: FESTIVAL_CONFIG.description,
    images: ["/waking-life-background.jpg"],
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
  themeColor: "#ec4899",
}

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: FESTIVAL_CONFIG.manifestName,
    url: FESTIVAL_CONFIG.siteUrl,
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Any",
    description: FESTIVAL_CONFIG.description,
  },
  {
    "@context": "https://schema.org",
    "@type": "MusicEvent",
    name: FESTIVAL_CONFIG.title,
    startDate: "2026-06-16",
    endDate: "2026-06-22",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    url: FESTIVAL_CONFIG.siteUrl,
    description: FESTIVAL_CONFIG.description,
    location: {
      "@type": "Place",
      name: "Waking Life",
      address: {
        "@type": "PostalAddress",
        addressCountry: "PT",
      },
    },
  },
]

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
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
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-L6WZZY6VE5"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-L6WZZY6VE5');
            `
          }}
        />
      </head>
      <body className={inter.className}>
        <GoogleAnalytics />
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
