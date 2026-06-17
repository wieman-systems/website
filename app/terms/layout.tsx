import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Wieman Systems",
  description:
    "The terms that govern use of the Wieman Systems website. Timelines and pricing shown are estimates; each engagement is governed by a separate signed services agreement.",
  openGraph: {
    title: "Terms of Service — Wieman Systems",
    description:
      "The terms that govern use of the Wieman Systems website.",
    url: "https://wiemansystems.com/terms",
    siteName: "Wieman Systems",
    type: "website",
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
