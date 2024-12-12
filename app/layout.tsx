import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { JetBrains_Mono } from "next/font/google";

const jbm = JetBrains_Mono({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: "Shreyas Deb | Portfolio",
  description: "The portfolio of Shreyas Deb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={jbm.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
