/**
 * All copy, stats, links and image alt text for the landing page.
 * Components import from here; nothing is hardcoded in JSX.
 */

// TODO: every href below is a placeholder. Replace with real URLs before launch.
const PLACEHOLDER_HREF = "#";

// Raster assets live in public/assets. For pure static hosting run
// `npm run optimize-images` and switch this to "webp".
import phoneFrames from "../../public/assets/phones-frames/manifest.json";
import demoFrames from "../../public/assets/demo-frames/manifest.json";

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
  // The official "equal ai" logo (EQUAL AI LOGO.svg from the brand files), 304:64.
  logo: { src: "/assets/logo.svg", alt: "Equal AI", width: 114, height: 24 },
  links: [
    { label: "About", href: "/resources" },
    { label: "Contact", href: "/contact" },
  ],
  menuLabel: "Menu",
};

export const hero = {
  eyebrow: "Meet Equal",
  headline: { line1: "Every call,", line2: "understood" },
  sub: "AI that handles your calls and gets things done for you.",
  // The arrow field behind the headline, exported from Figma node 2225:157.
  background: { src: asset("hero-arrows"), alt: "" },
  // Green wash that sits behind the phone, from phone-section-bg.png downscaled
  // by `node -e` (the original is 5760px and 6MB for a soft gradient).
  ambient: { src: "/assets/phone-ambient.webp", alt: "" },
  // Arrives as a close-up of its top edge, pulls back to full size, then goes.
  phone: {
    src: asset("phone-glow"),
    alt: "iPhone showing the Equal app on a live call, with Hold and End buttons",
    width: 2912,
    height: 4068,
    // Measured off the baked asset: the handset occupies this band of the
    // image's height, the rest being its glow. The stage uses both to keep the
    // handset's size and top edge fixed however wide the glow is. Re-measure if
    // PAD or GLOW in scripts/make-hero-assets.mjs change.
    inset: 0.718,
    insetTop: 0.1382,
  },
};

// A scatter of dots that flicker over the arrow field. Positions come from a
// seeded generator rather than Math.random so the server and the client lay
// them out identically — random values here would mismatch on hydration.
export const sparks = (() => {
  let seed = 20260924;
  const next = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  return Array.from({ length: 60 }, () => ({
    x: +(next() * 100).toFixed(2),
    y: +(next() * 100).toFixed(2),
    size: +(2.2 + next() * 3.4).toFixed(2),
    delay: +(next() * -8).toFixed(2),
    duration: +(3.4 + next() * 4.2).toFixed(2),
    peak: +(0.55 + next() * 0.45).toFixed(2),
  }));
})();

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

// The product demo after the headline. Up to the "Click here to watch Equal
// AI in action" screen it is scrubbed by scroll (frames from
// media/product-demo.mp4 via `node scripts/extract-demo-frames.mjs`); there
// the scroll waits for a tap on the phone, and the rest plays as a real video
// with sound (public/assets/demo-watch.mp4, cut from that same frame).
export const demo = {
  frames: {
    dir: "/assets/demo-frames",
    // Scrolling only ever covers the clip up to the watch screen; after it
    // the demo exists only as the video.
    count: demoFrames.gate + 1,
    version: demoFrames.version,
    width: demoFrames.width,
    height: demoFrames.height,
    alt: "Equal answering an incoming call and chatting with the caller on your behalf",
  },
  gate: demoFrames.gate,
  watch: demoFrames.watch,
  video: "/assets/demo-watch.mp4",
  // The frames run between these points of the section's scroll, ending on
  // the watch screen (where the scroll waits): before, the demo fades up
  // behind the departing headline; after, a short hold and it fades away.
  playFrom: 0.1,
  playTo: 0.82,
  prompt: {
    watch: "Tap the phone to watch",
    skip: "Skip demo",
    mute: "Mute",
    unmute: "Sound on",
  },
};

export const statement = {
  // After the demo: each line lights in turn (text -> white, accent -> green)
  // as the scroll holds.
  lines: [
    { text: "Your calls, ", accent: "handled." },
    { text: "Your tasks, ", accent: "taken care of." },
    { text: "Your life, ", accent: "uninterrupted." },
  ],
};

export const multiDevice = {
  // One scrubbed sequence: a lone phone on the lock screen, joined by two more,
  // then the three turning through the app's screens. Frames come from
  // media/phones-features.mp4 via `npm run extract-frames`.
  frames: {
    dir: "/assets/phones-frames",
    count: phoneFrames.count,
    version: phoneFrames.version,
    width: phoneFrames.width,
    height: phoneFrames.height,
    cuts: phoneFrames.cuts,
    alt: "A phone showing an Equal call notification, joined by two more as they turn through call summaries, instructions and language settings",
  },
  // The phones fade up at normal size on the right, then the clip plays from
  // playFrom; it finishes as the section starts to fade (0.9) so the fade runs
  // on a still.
  playFrom: 0.06,
  playTo: 0.9,
  // One per app screen, shown while it is up and swapped during the spin to
  // the next. In the content doc's order, which is not quite the video's (it
  // turns notification, summary, chat, instructions, languages), so the last
  // three do not sit on their matching screen — kept that way as asked.
  captions: [
    { title: "Know who's calling", text: "See who's calling and why before you pick up." },
    {
      title: "Calls summarised, next steps sorted",
      text: "Get a summary and recording after every call, along with the next steps and actions.",
    },
    { title: "Tell Equal how to handle it", text: "Set your instructions once. Equal follows them when the call comes in." },
    { title: "Speaks your language", text: "Equal speaks 9 languages, including 8 Indian languages." },
    { title: "Let Equal make the call", text: "Give Equal the message. It'll call and deliver it for you." },
  ],
};

export const testimonials = {
  heading: { line1: "See how Equal fits", line2: "into real life." },
  sub: "Calls, follow-ups, interruptions and everything in between — see how people are putting Equal to work.",
  // Ten cards run as one continuous left-scrolling strip, three in view at a
  // time. Portraits are in public/assets/voices.
  cards: [
    { img: "/assets/voices/01.webp", name: "Karan Mehta", line: "uses Equal AI to filter non-urgent calls and stay in flow.", role: "Founder, Product Studio" },
    { img: "/assets/voices/02.webp", name: "Ira Kapoor", line: "uses Equal AI to organise her day and focus on what matters.", role: "Creative Lead" },
    { img: "/assets/voices/03.webp", name: "Aditya Rao", line: "solves call clutter with Equal AI and gets more done.", role: "Operations Manager" },
    { img: "/assets/voices/04.webp", name: "Meera Nair", line: "lets Equal AI summarise every call so nothing gets lost.", role: "Head of Partnerships" },
    { img: "/assets/voices/05.webp", name: "Rohan Desai", line: "uses Equal AI to catch up on the calls he could not take.", role: "Sales Lead" },
    { img: "/assets/voices/06.webp", name: "Ananya Iyer", line: "relies on Equal AI to turn every call into clear next steps.", role: "Product Manager" },
    { img: "/assets/voices/07.webp", name: "Vikram Shah", line: "uses Equal AI to keep his team in the loop after every call.", role: "Agency Director" },
    { img: "/assets/voices/08.webp", name: "Priya Menon", line: "uses Equal AI so follow-ups never slip through the cracks.", role: "Client Services" },
    { img: "/assets/voices/09.webp", name: "Arjun Bhat", line: "uses Equal AI to stay present in calls instead of taking notes.", role: "Engineering Manager" },
    { img: "/assets/voices/10.webp", name: "Sanya Raghavan", line: "uses Equal AI to hand off calls without repeating herself.", role: "Community Manager" },
  ],
  card: { width: 880, height: 1168 },
};

// TODO: verify before launch
export const stats = [
  { value: "1M+", label: "Users" },
  { value: "25M+", label: "Calls handled" },
  { value: "4.8", label: "Play Store Rating" },
];

export const footer = {
  tagline: { line1: "A quieter", line2: "day starts here" },
  sub: "Get more things done without doing it all yourself.",
  columns: [
    {
      heading: "Product",
      links: [
        { label: "Overview", href: PLACEHOLDER_HREF },
        { label: "Features", href: PLACEHOLDER_HREF },
        { label: "Use Cases", href: PLACEHOLDER_HREF },
      ],
    },
    {
      heading: "Company",
      links: [
        { label: "About", href: "/resources" },
        { label: "Blog", href: "/blog" },
        { label: "Contact", href: "/contact" },
      ],
    },
    {
      heading: "Support",
      links: [
        { label: "Help Centre", href: "/resources" },
        { label: "FAQs", href: "/faqs" },
        { label: "Privacy Policy", href: "/privacy-policy" },
        { label: "Terms & Conditions", href: "/terms-and-conditions" },
      ],
    },
  ],
  social: {
    heading: "Social",
    // Instagram/LinkedIn/email are Equal's own, from the resources site; do not
    // use the RIOO URLs from the Figma file. Website is still a placeholder.
    links: [
      { label: "Instagram", href: "https://www.instagram.com/myequal.ai/", icon: "/assets/instagram.svg", width: 24, height: 24 },
      { label: "LinkedIn", href: "https://linkedin.com/company/myequalai", icon: "/assets/linkedin.svg", width: 24, height: 24 },
      { label: "Website", href: PLACEHOLDER_HREF, icon: "/assets/web.svg", width: 24, height: 24 },
      { label: "Email", href: "mailto:hey@equal.in", icon: "/assets/social-4.svg", width: 30, height: 23 },
    ],
  },
  // Also printed in the wordmark image itself; repeated as text for phones,
  // where the image's lettering is too small to read.
  legal: {
    copyright: "© 2026 Equal AI. All rights reserved.",
    motto: "Made for a more intentional day.",
  },
  wordmark: {
    src: asset("footer-wordmark"),
    alt: "equal ai — © 2026 Equal AI. All rights reserved. Made for a more intentional day.",
  },
};
