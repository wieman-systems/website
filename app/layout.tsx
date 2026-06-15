import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const spaceMono = Space_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Wieman Systems — Custom AI Systems",
  description:
    "Wieman Systems designs, builds, and runs intelligent automation and data systems — turning months of manual work into workflows that run themselves.",
  openGraph: {
    title: "Wieman Systems — Custom AI Systems",
    description:
      "Custom AI systems, automation, and intelligent dashboards for businesses of all kinds.",
    url: "https://wiemansystems.com",
    siteName: "Wieman Systems",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wieman Systems — Custom AI Systems",
    description: "Custom AI systems that do your team's busywork for you.",
  },
  metadataBase: new URL("https://wiemansystems.com"),
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${spaceMono.variable}`}>
      <body style={{ fontFamily: "var(--font-display), sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
