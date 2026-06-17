import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — Wieman Systems",
  description:
    "Wieman Systems is one builder making cutting-edge automation systems for businesses. Your data stays in your accounts, and you work directly with the person building it.",
  openGraph: {
    title: "About — Wieman Systems",
    description:
      "One builder, working at the frontier — turning a business's busywork into systems that run themselves.",
    url: "https://wiemansystems.com/about",
    siteName: "Wieman Systems",
    type: "website",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
