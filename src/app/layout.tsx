import type { Metadata } from "next";
import Script from "next/script";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import CustomCursor from "@/components/effects/CustomCursor";
import SkipToContent from "@/components/ui/SkipToContent";
import { JsonLdScript } from "@/lib/schema";

// Elegant serif for headings
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

// Clean sans-serif for body
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Monospace for code
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
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
  },
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
  verification: {
    // Add your Google Search Console verification code here after setup
    // google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
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
        className={`${playfair.variable} ${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-[#f1efe7] text-[#1a1a1a]`}
      >
        <SkipToContent />
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}

