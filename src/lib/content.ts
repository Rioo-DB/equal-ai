/**
 * All copy, stats, links and image alt text for the landing page.
 * Components import from here; nothing is hardcoded in JSX.
 */

// TODO: every href below is a placeholder. Replace with real URLs before launch.
const PLACEHOLDER_HREF = "#";

// Raster assets live in public/assets. For pure static hosting run
// `npm run optimize-images` and switch this to "webp".
const IMAGE_FORMAT: "png" | "webp" = "png";
const asset = (name: string) => `/assets/${name}.${IMAGE_FORMAT}`;

export const site = {
  name: "Equal AI",
  ogImage: { src: asset("hero-bg"), width: 5760, height: 3760 },
  title: "Equal AI — Every call, understood",
  description:
    "Equal AI answers, understands and summarises your calls in real time, so the important work gets done and you get more time for what matters.",
};

export const header = {
  logo: { src: asset("logo"), alt: "Equal", width: 99, height: 29 },
  links: [
    { label: "About", href: PLACEHOLDER_HREF },
    { label: "Contact", href: PLACEHOLDER_HREF },
  ],
  cta: { label: "Get Started", href: PLACEHOLDER_HREF },
  menuLabel: "Menu",
};

export const hero = {
  headline: { line1: "Every call,", line2: "understood" },
  scroll: { label: "Scroll Down", target: "#showcase" },
  background: { src: asset("hero-bg"), alt: "" },
};

export const showcase = {
  id: "showcase",
  background: { src: asset("phone-section-bg"), alt: "" },
  phone: {
    src: asset("phone-single"),
    alt: "iPhone showing the Equal app on a live call, with Hold and End buttons",
    width: 578,
    height: 867,
  },
};

export const statement = {
  line1: "Every call, understood",
  line2: { white: "Important work, ", accent: "done." },
  line3: "More time for what matters.",
};

export const multiDevice = {
  image: {
    src: asset("phones-trio"),
    alt: "Five iPhones fanned out, the centre one showing the Equal app on a live call",
    width: 788,
    height: 715,
  },
};

export const testimonials = {
  heading: { line1: "Real people.", line2: "Real time saved." },
  image: {
    src: asset("testimonials"),
    alt:
      "Three five-star Google verified reviews. " +
      "Rohan Mehta, Business Owner at Scale Studio: “Equal takes care of my calls so I can focus on growing my business. It feels like having an extra team member.” " +
      "Aarav Sharma, Founder & CEO at FluxBox: “Equal has completely changed the way I handle calls. It understands, summarizes and helps me take action — all in real time.” " +
      "Neha Kapoor, Marketing Director at GrowthVerse: “I no longer miss important conversations. Equal keeps me in the loop and gives me clear action items, which saves hours every week.”",
    width: 1335,
    height: 451,
  },
};

// TODO: verify before launch
export const stats = [
  { value: "1M+", label: "Users" },
  { value: "25M+", label: "Calls handled" },
  { value: "4.8", label: "Play Store Rating" },
];

export const statsSection = {
  map: {
    src: asset("india-map"),
    alt: "Dotted map of India with glowing green points marking cities where Equal is used",
    width: 1001,
    height: 1155,
  },
};

export const footer = {
  tagline: { line1: "A quieter", line2: "day starts here" },
  cta: { label: "Get Started", href: PLACEHOLDER_HREF },
  columns: [
    {
      heading: "Product",
      links: [
        { label: "Overview", href: PLACEHOLDER_HREF },
        { label: "Features", href: PLACEHOLDER_HREF },
        { label: "Use Cases", href: PLACEHOLDER_HREF },
        { label: "Pricing", href: PLACEHOLDER_HREF },
      ],
    },
    {
      heading: "Company",
      links: [
        { label: "About", href: PLACEHOLDER_HREF },
        { label: "Careers", href: PLACEHOLDER_HREF },
        { label: "Blog", href: PLACEHOLDER_HREF },
        { label: "Contact", href: PLACEHOLDER_HREF },
      ],
    },
    {
      heading: "Support",
      links: [
        { label: "Help Centre", href: PLACEHOLDER_HREF },
        { label: "FAQs", href: PLACEHOLDER_HREF },
        { label: "Privacy Policy", href: PLACEHOLDER_HREF },
        { label: "Terms & Conditions", href: PLACEHOLDER_HREF },
      ],
    },
  ],
  social: {
    heading: "Social",
    // TODO: placeholder hrefs — do not use the RIOO URLs from the Figma file.
    links: [
      { label: "Instagram", href: PLACEHOLDER_HREF, icon: "/assets/instagram.svg", width: 24, height: 24 },
      { label: "LinkedIn", href: PLACEHOLDER_HREF, icon: "/assets/linkedin.svg", width: 24, height: 24 },
      { label: "Website", href: PLACEHOLDER_HREF, icon: "/assets/web.svg", width: 24, height: 24 },
      { label: "Email", href: PLACEHOLDER_HREF, icon: "/assets/social-4.svg", width: 30, height: 23 },
    ],
  },
  wordmark: {
    src: asset("footer-wordmark"),
    alt: "equal ai — © 2026 Equal AI. All rights reserved. Made for a more intentional day.",
  },
};
