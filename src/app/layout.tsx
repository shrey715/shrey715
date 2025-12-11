import type { Metadata } from "next";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import CustomCursor from "@/components/effects/CustomCursor";

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
  title: "Shreyas Deb | Developer & CS Student",
  description: "Portfolio of Shreyas Deb - Dual Degree student (CS + MS by Research) at IIIT Hyderabad. Building elegant solutions with modern web technologies, systems programming, and machine learning.",
  keywords: ["Shreyas Deb", "Developer", "IIIT Hyderabad", "Computer Science", "Dual Degree", "CND", "Portfolio", "Web Development", "React", "TypeScript"],
  authors: [{ name: "Shreyas Deb" }],
  openGraph: {
    title: "Shreyas Deb | Developer",
    description: "Developer crafting digital experiences. Dual Degree Student @ IIIT Hyderabad.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shreyas Deb | Developer",
    description: "Developer crafting digital experiences. Dual Degree Student @ IIIT Hyderabad.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${playfair.variable} ${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-[#f1efe7] text-[#1a1a1a]`}
      >
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
