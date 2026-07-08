import type { Metadata } from 'next'
import './globals.css'
import { WebBuilderProvider } from '@/app/providers/WebBuilderProvider'
import { ErrorBoundary } from '@/app/components/ui/ErrorBoundary'
import { ThemeFontWrapper } from './components/ui/ThemeFontWrapper'
import { SiteFavicon } from './components/ui/SiteFavicon'
import { LanguageProvider } from '@/app/i18n/LanguageProvider'
import { LenisProvider } from '@/app/components/cinematic/LenisProvider'
import { AmbientFoundation } from '@/app/components/cinematic/AmbientFoundation'
import { HeroIntroProvider } from '@/app/providers/HeroIntroProvider'
import { Header } from '@/app/components/layout/Header'
import { siteApi } from '@/app/lib/api'
import { getSiteIcons } from '@/app/lib/metadata'

export async function generateMetadata(): Promise<Metadata> {
  const siteSlug = process.env.NEXT_PUBLIC_WEBBUILDER_SITE_SLUG

  if (!siteSlug) {
    return {
      title: 'Web Builder Site',
      description: 'Generated site using Web Builder',
    }
  }

  try {
    const site = await siteApi.getSiteBySlug(siteSlug, { silent: true })
    const icons = getSiteIcons(site)

    return {
      title: site.business?.name || site.name || 'Web Builder Site',
      description:
        site.seo?.description ||
        site.business?.description ||
        'Generated site using Web Builder',
      ...(icons ? { icons } : {}),
    }
  } catch {
    return {
      title: 'Web Builder Site',
      description: 'Generated site using Web Builder',
    }
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className="antialiased">
        <ErrorBoundary>
          <WebBuilderProvider>
            <SiteFavicon />
            <LanguageProvider>
              <LenisProvider>
                <AmbientFoundation />
                <HeroIntroProvider>
                  <ThemeFontWrapper>
                    <Header />
                    <main className="relative z-10 min-h-screen pt-[var(--wb-header-height)]">
                      {children}
                    </main>
                  </ThemeFontWrapper>
                </HeroIntroProvider>
              </LenisProvider>
            </LanguageProvider>
          </WebBuilderProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
