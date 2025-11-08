import type { Metadata } from 'next'
import { Inter, Quicksand } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import Footer from '@/components/ui/organisms/Footer'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })
const quicksand = Quicksand({ subsets: ['latin'], variable: '--font-quicksand' })

export const metadata: Metadata = {
  title: 'EchoBloom - Plant Your Echoes, Watch Your Wellness Bloom',
  description: 'AI-Powered Empathy Garden for Mental Wellness. Transform your emotions into a beautiful 3D garden with personalized AI support.',
  keywords: ['mental health', 'wellness', 'meditation', 'journaling', 'AI therapy', 'emotional support', 'mindfulness'],
  authors: [{ name: 'EchoBloom Team' }],
  openGraph: {
    title: 'EchoBloom - AI-Powered Mental Wellness Garden',
    description: 'Plant your echoes, watch your wellness bloom',
    type: 'website',
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' }
    ],
    apple: '/apple-touch-icon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: undefined,
        variables: { colorPrimary: '#A8D5BA' }
      }}
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#A8D5BA" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                // Filter out Chrome extension errors
                window.addEventListener('error', function(e) {
                  if (e.filename && e.filename.includes('chrome-extension://')) {
                    e.stopImmediatePropagation();
                    return false;
                  }
                });
              `
            }}
          />
        </head>
        <body className={`${inter.className} ${quicksand.variable}`} suppressHydrationWarning>
          <div className="flex flex-col min-h-screen">
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </body>
      </html>
    </ClerkProvider>
  )
}