import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

// Runs synchronously before first paint to commit the theme onto
// <html data-theme>, so a returning dark-mode visitor loads dark with no white
// flash. Defaults to LIGHT — the OS preference is ignored; dark only applies
// when the visitor explicitly chose it (stored as 'dark'). CSP allows inline
// scripts (script-src 'self' 'unsafe-inline').
const NO_FLASH_THEME = `(function(){try{var d=localStorage.getItem('ws-theme')==='dark',t=d?'dark':'light',r=document.documentElement;r.setAttribute('data-theme',t);var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',d?'#0b0b0c':'#ffffff');}catch(e){}})();`;

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
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${spaceMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH_THEME }} />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
