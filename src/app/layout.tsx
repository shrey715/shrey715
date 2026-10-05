import type { Metadata } from "next";
import Script from "next/script";
import { Anton, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import CustomCursor from "@/components/effects/CustomCursor";
import ScrollIndicator from "@/components/effects/ScrollIndicator";
import StatusReadout from "@/components/effects/StatusReadout";
import Preloader from "@/components/effects/Preloader";
import LenisProvider from "@/components/effects/LenisProvider";
import Navbar from "@/components/ui/Navbar";
import ViewTransitionBridge from "@/components/effects/ViewTransitionBridge";
import { JsonLdScript } from "@/lib/schema";
import { getSiteIndex } from "@/lib/siteIndex";
import CommandPalette from "@/components/ui/CommandPalette";

// Massive condensed display face for hero + section megatype
const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

// Techy grotesque for UI + body
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

// Monospace for index numbers, labels, metadata, code
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://shrey715.vercel.app"),
  title: "Shreyas Deb | Developer & CS Student",
  description: "Portfolio of Shreyas Deb - Dual Degree student (CS + MS by Research) at IIIT Hyderabad. Building elegant solutions with modern web technologies, systems programming, and machine learning.",
  keywords: ["Shreyas Deb", "Developer", "IIIT Hyderabad", "Computer Science", "Dual Degree", "CND", "Portfolio", "Web Development", "React", "TypeScript"],
  authors: [{ name: "Shreyas Deb" }],
  creator: "Shreyas Deb",
  publisher: "Shreyas Deb",
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": [{ url: "/rss.xml", title: "Shreyas Deb — Field Notes" }] },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon.png", sizes: "any", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "Shreyas Deb | Developer",
    description: "Developer crafting digital experiences. Dual Degree Student @ IIIT Hyderabad.",
    url: "https://shrey715.vercel.app",
    siteName: "Shreyas Deb Portfolio",
    images: [
      {
        url: "/shreyas_cropped.png",
        width: 800,
        height: 800,
        alt: "Shreyas Deb",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shreyas Deb | Developer",
    description: "Developer crafting digital experiences. Dual Degree Student @ IIIT Hyderabad.",
    images: ["/shreyas_cropped.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const site = await getSiteIndex();

  return (
    // Font variables live on <html> so the :root-level Tailwind @theme tokens
    // (--font-display: var(--font-anton) …) can actually resolve them.
    <html lang="en" className={`${anton.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <head>
        <JsonLdScript />
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-FCS62G8M7J"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-FCS62G8M7J');
          `}
        </Script>
      </head>
      <body
        className="font-sans antialiased bg-paper text-ink"
      >
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100001] focus:bg-accent focus:text-paper focus:font-mono-label focus:text-xs focus:px-3 focus:py-2"
        >
          SKIP TO CONTENT
        </a>
        <LenisProvider>
          <ViewTransitionBridge />
          <Preloader />
          <CustomCursor />
          <ScrollIndicator />
          <StatusReadout latestPush={site.latestPush} />
          <Navbar counts={site.counts} />
          <CommandPalette index={site} />
          {children}
        </LenisProvider>
      </body>
    </html>
  );
}

