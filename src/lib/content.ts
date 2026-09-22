/**
 * All copy, stats, links and image alt text for the landing page.
 * Components import from here; nothing is hardcoded in JSX.
 */

// TODO: every href below is a placeholder. Replace with real URLs before launch.
const PLACEHOLDER_HREF = "#";

// Raster assets live in public/assets. For pure static hosting run
// `npm run optimize-images` and switch this to "webp".
import phoneFrames from "../../public/assets/phones-frames/manifest.json";

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
  // SVG rebuild of the logotype; the original PNG was only 71x21 and blurred on
  // retina screens. See public/assets/logo.svg.
  logo: { src: "/assets/logo.svg", alt: "Equal", width: 99, height: 29 },
  links: [
    { label: "About", href: PLACEHOLDER_HREF },
    { label: "Contact", href: PLACEHOLDER_HREF },
  ],
  cta: { label: "Get Started", href: PLACEHOLDER_HREF },
  menuLabel: "Menu",
};

export const hero = {
  headline: { line1: "Every call,", line2: "understood" },
  sub: "Your AI assistant for calls, notes and follow-ups so you can focus on what matters.",
  // Planet limb with a mint rim light; sinks as the phone comes in.
  horizon: { src: asset("planet-horizon") },
  background: { src: asset("hero-bg"), alt: "" },
  // Blooms around the phone once it is centred, then fades before the next section.
  ambient: { src: asset("phone-section-bg") },
  // Revealed as the hero scrolls: the headline moves left and this fades in.
  phone: {
    src: asset("phone-single"),
    alt: "iPhone showing the Equal app on a live call, with Hold and End buttons",
    width: 578,
    height: 867,
  },
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
  // Each line lights up (text -> white, accent -> green) as it scrolls past the viewport centre.
  lines: [
    { text: "Every call, ", accent: "understood" },
    { text: "Important work, ", accent: "done." },
    { text: "More time for what ", accent: "matters." },
  ],
  // Line lit before scrolling starts (and when reduced motion is preferred).
  initial: 1,
};

export const multiDevice = {
  // Scrubbed by scroll: one full turn of the phones per pass through the section.
  // Frames come from public/assets/phones-rotate.mp4 via `npm run extract-frames`.
  frames: {
    dir: "/assets/phones-frames",
    count: phoneFrames.count,
    size: phoneFrames.size,
    alt: "Five iPhones fanned out, rotating as you scroll; the centre one shows the Equal app on a live call",
  },
};

export const testimonials = {
  heading: { line1: "Real people.", line2: "Real time saved." },
  // Card the carousel opens on.
  initial: 1,
  cards: [
    {
      src: asset("testimonial-1"),
      alt: "Five-star Google verified review. Rohan Mehta, Business Owner at Scale Studio: “Equal takes care of my calls so I can focus on growing my business. It feels like having an extra team member.”",
    },
    {
      src: asset("testimonial-2"),
      alt: "Five-star Google verified review. Aarav Sharma, Founder & CEO at FluxBox: “Equal has completely changed the way I handle calls. It understands, summarizes and helps me take action — all in real time.”",
    },
    {
      src: asset("testimonial-3"),
      alt: "Five-star Google verified review. Neha Kapoor, Marketing Director at GrowthVerse: “I no longer miss important conversations. Equal keeps me in the loop and gives me clear action items, which saves hours every week.”",
    },
  ],
  // Source PNGs are 1200x1025 crops of the original composite.
  card: { width: 1200, height: 1025 },
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
    // Centres of the large city dots baked into the PNG, as % of its width/height
    // (measured from the image). Each gets a live "ping" pulse layered on top.
    pings: [
      [34.02, 11.26],
      [34.02, 22.34],
      [37.06, 33.59],
      [91.91, 35.97],
      [9.89, 39.31],
      [55.49, 39.44],
      [85.61, 46.93],
      [26.82, 48.27],
      [55.39, 49.18],
      [15.68, 50.35],
      [64.19, 54.07],
      [40.41, 56.02],
      [18.58, 64.24],
      [46.5, 64.98],
      [32.97, 79.52],
      [29.12, 89.39],
    ] as [number, number][],
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
