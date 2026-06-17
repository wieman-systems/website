import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Wieman Systems",
  description:
    "How Wieman Systems LLC handles personal information and client data. Your data stays in your own accounts; we never sell it or train AI models on it.",
  openGraph: {
    title: "Privacy Policy — Wieman Systems",
    description:
      "How Wieman Systems LLC handles personal information and client data.",
    url: "https://wiemansystems.com/privacy",
    siteName: "Wieman Systems",
    type: "website",
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
