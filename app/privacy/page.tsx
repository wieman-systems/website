import LegalPage, { type LegalSection } from "@/components/LegalPage";

const SECTIONS: LegalSection[] = [
  {
    heading: "Who we are",
    body: [
      "Wieman Systems is operated by Wieman Systems LLC (“Wieman Systems,” “we,” “us”), based in Stillwater, Oklahoma. This Privacy Policy explains what information we collect through this website and our sales and onboarding process, and how we use and protect it.",
      "You can reach us about anything in this policy at caleb@wiemansystems.com.",
    ],
  },
  {
    heading: "Scope of this policy",
    body: [
      "This policy covers information we collect through this website and while discussing, scoping, and setting up an engagement. The data inside the systems we build for a client — including that client’s business data and its own customers’ data — is governed by the separate written services agreement and any data-processing terms we sign with that client. Where those terms conflict with this policy, the signed agreement controls for that engagement.",
    ],
  },
  {
    heading: "Information we collect",
    body: [
      "We keep collection deliberately small. We collect:",
    ],
    bullets: [
      "Information you give us — your name, email address, and the contents of any message you send through our contact form or by email.",
      "Basic technical data — standard server and security logs (such as IP address, browser type, and pages requested) generated when you visit the site.",
    ],
  },
  {
    heading: "How we use information",
    body: [
      "We use the information above to respond to your inquiry, to scope and provide our services, to operate and secure the website, and to meet legal and accounting obligations. We do not sell your personal information, and we do not use it for advertising.",
    ],
  },
  {
    heading: "Your data stays yours",
    body: [
      "When we build a system for you, we work inside your own accounts, cloud, and tools, using least-privilege access scoped to what the work requires. We do not sell, rent, or share your data or your customers’ data, and we do not use it to train AI models. Any third-party AI services used in a build are configured, where the provider supports it, so that your content is not retained for training. The specifics for each engagement are set out in your services agreement.",
    ],
  },
  {
    heading: "Service providers",
    body: [
      "We rely on a small set of reputable vendors to run the business — for example, website hosting, email delivery, and database infrastructure. These providers process information only to provide their service to us, under their own contractual and security obligations. We do not sell data to anyone.",
    ],
  },
  {
    heading: "Data retention",
    body: [
      "We keep inquiry and engagement records only as long as needed for the purpose they were collected and for legitimate business, legal, and accounting reasons, after which we delete or anonymize them. Client project data is retained and deleted per the terms of the relevant services agreement.",
    ],
  },
  {
    heading: "Security",
    body: [
      "We take reasonable technical and organizational measures to protect information, including least-privilege access, encryption in transit, and keeping secrets out of source code. No method of transmission or storage is perfectly secure, but we work to protect your information and to limit what we hold in the first place.",
    ],
  },
  {
    heading: "Your rights",
    body: [
      "You may ask us to access, correct, or delete the personal information we hold about you, or to stop contacting you. Email caleb@wiemansystems.com and we will respond within a reasonable time. Depending on where you live, you may have additional rights under applicable privacy laws.",
    ],
  },
  {
    heading: "Cookies and analytics",
    body: [
      "This site uses only what it needs to function and stay secure. If we add analytics or other optional tracking in the future, we will update this policy first.",
    ],
  },
  {
    heading: "Children",
    body: [
      "This site and our services are intended for businesses and adults. We do not knowingly collect personal information from children.",
    ],
  },
  {
    heading: "Changes to this policy",
    body: [
      "We may update this policy as our practices or the law change. We will revise the “Last updated” date above when we do, and material changes will be reflected on this page.",
    ],
  },
  {
    heading: "Contact",
    body: [
      "Questions about this policy or your information? Email caleb@wiemansystems.com.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="PRIVACY"
      title="Privacy Policy"
      lastUpdated="June 16, 2026"
      intro="We collect as little as possible, we never sell it, and your project data stays in your own accounts. Here is exactly how we handle information."
      sections={SECTIONS}
    />
  );
}
