import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { FavoritesProvider } from "@/contexts/favorites-context"
import { OfflineInitializer } from "@/components/offline-initializer"
import { GoogleAnalytics } from "@/components/google-analytics"
import { FESTIVAL_CONFIG } from "@/lib/festival-config"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: FESTIVAL_CONFIG.appTitle,
  description: FESTIVAL_CONFIG.description,
  manifest: "/manifest.json",
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
