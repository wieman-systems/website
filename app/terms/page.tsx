import LegalPage, { type LegalSection } from "@/components/LegalPage";

const SECTIONS: LegalSection[] = [
  {
    heading: "About these terms",
    body: [
      "These Terms of Service (“Terms”) govern your use of the Wieman Systems website at wiemansystems.com, operated by Wieman Systems LLC (“Wieman Systems,” “we,” “us”). By using the site you agree to these Terms. If you don’t agree, please don’t use the site.",
      "Any paid engagement is governed by a separate written services agreement or statement of work signed by both parties. Where that agreement conflicts with these Terms, the signed agreement controls for that engagement.",
    ],
  },
  {
    heading: "The website is informational",
    body: [
      "This site describes what we do and how we work. Nothing on it is an offer, a binding quote, a guarantee of results, or professional advice you should act on without a scoped agreement. A binding engagement exists only once we’ve both signed a proposal or statement of work.",
    ],
  },
  {
    heading: "Estimates, timelines, and pricing",
    body: [
      "Any timelines or prices described on this site — including ranges such as “2–4 weeks” — are illustrative estimates based on typical projects, not promises. The actual scope, price, and schedule for your project are defined in a written proposal you approve before any work begins.",
      "If the scope changes after work starts, we agree the change and any adjustment to price or timeline in writing first. We do not bill for out-of-scope work you haven’t approved.",
    ],
  },
  {
    heading: "Intellectual property and trademarks",
    body: [
      "The content, design, and branding of this website are owned by Wieman Systems LLC. Ownership of deliverables produced in an engagement is set out in the relevant services agreement.",
      "Third-party product names, logos, and trademarks shown on this site — including the tools we integrate with — are the property of their respective owners. They are shown to indicate compatibility and do not imply any partnership, sponsorship, or endorsement.",
    ],
  },
  {
    heading: "Disclaimer of warranties",
    body: [
      "The website is provided “as is” and “as available,” without warranties of any kind, whether express or implied. To the fullest extent permitted by law, we disclaim the implied warranties of merchantability, fitness for a particular purpose, and non-infringement, and we do not warrant that the site will be uninterrupted, error-free, or secure.",
      "Warranties relating to services we perform for a client, if any, are stated exclusively in that client’s signed services agreement — not on this website.",
    ],
  },
  {
    heading: "Limitation of liability",
    body: [
      "To the fullest extent permitted by law, Wieman Systems LLC will not be liable for any indirect, incidental, special, consequential, or punitive damages, or for any lost profits, revenue, or data, arising out of or relating to your use of this website. Our total liability for any claim arising from your use of the website will not exceed one hundred US dollars (US $100).",
      "Liability arising from a paid engagement is governed solely by the limitation-of-liability terms in that engagement’s signed services agreement. Nothing in these Terms limits liability that cannot be limited under applicable law.",
    ],
  },
  {
    heading: "Third-party links and services",
    body: [
      "This site may reference or link to third-party tools and websites. We don’t control them and aren’t responsible for their content, availability, or practices. Your use of a third-party service is governed by that party’s own terms.",
    ],
  },
  {
    heading: "Governing law",
    body: [
      "These Terms are governed by the laws of the State of Oklahoma, without regard to its conflict-of-laws rules. The state and federal courts located in Oklahoma will have exclusive jurisdiction over any dispute relating to these Terms or this website.",
    ],
  },
  {
    heading: "Changes to these terms",
    body: [
      "We may update these Terms from time to time. We will revise the “Last updated” date above when we do, and your continued use of the site after a change means you accept the updated Terms.",
    ],
  },
  {
    heading: "Contact",
    body: [
      "Questions about these Terms? Email caleb@wiemansystems.com.",
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="TERMS"
      title="Terms of Service"
      lastUpdated="June 16, 2026"
      intro="Plain version: this website is informational, the timelines and prices here are estimates, and real projects are governed by a separate signed agreement. The full terms are below."
      sections={SECTIONS}
    />
  );
}
