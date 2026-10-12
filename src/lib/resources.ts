/**
 * Content for the Resources section (blog, updates, FAQs, privacy, contact).
 *
 * The JSON in src/content/resources was scraped from
 * https://equal-resources.vishnu-b.workers.dev and cleaned by
 * scripts/extract-resources.py: internal links are rewritten to this site's
 * routes, images point at public/resources, and every `body`/`answer` field is
 * sanitised HTML limited to p, br, strong, em, a, ul, ol, li and h2-h4.
 */
import resourcesHub from "@/content/resources/resources-hub.json";
import faqsHub from "@/content/resources/faqs-hub.json";
import blog from "@/content/resources/blog.json";
import updates from "@/content/resources/updates.json";
import helpAndroid from "@/content/resources/help-android.json";
import helpIos from "@/content/resources/help-ios.json";
import callerFaqs from "@/content/resources/caller-faqs.json";
import privacy from "@/content/resources/privacy.json";
import terms from "@/content/resources/terms.json";
import contact from "@/content/resources/contact.json";

export type HubCard = {
  title: string;
  description: string | null;
  href: string;
  image: string | null;
  imageAlt: string;
};

export type Hub = { title: string; lede: string; cards: HubCard[] };

export type Post = {
  slug: string;
  title: string;
  subtitle: string;
  date: string;
  image: string | null;
  body: string;
};

export type QA = { id: string; question: string; answer: string };

export type HelpCategory = { slug: string; title: string; image: string | null; items: QA[] };

export type Platform = "android" | "ios";

export const resources: Hub = resourcesHub;
export const faqs: Hub = faqsHub;
export const posts: Post[] = blog;
export const releases: {
  title: string;
  lede: string;
  groups: { month: string; items: { title: string; date: string; body: string; media: string | null }[] }[];
} = updates;
export const callers: { title: string; lede: string; items: QA[] } = callerFaqs;
export const privacyPolicy: {
  title: string;
  effective: string;
  sections: { title: string | null; body: string }[];
} = privacy;
// Scraped from https://myequal.ai/terms-and-conditions/ and cleaned with the
// same sanitiser as the rest (scripts/extract-resources.py).
export const termsPage: {
  title: string;
  effective: string;
  sections: { title: string | null; body: string }[];
} = terms;
export const contactPage = contact;

export const blogIntro = {
  title: "Blog",
  lede: "How we think about calls, spam and the Indian phone — written for the people who use the assistant every day.",
};

export const help: Record<Platform, { title: string; lede: string; categories: HelpCategory[] }> = {
  android: helpAndroid,
  ios: helpIos,
};

export const platforms = Object.keys(help) as Platform[];

export const isPlatform = (value: string): value is Platform => value in help;

/** "27 JUN, 2026" / "01 JUN, 2026" -> "27 Jun, 2026" / "1 Jun, 2026" */
export const formatDate = (date: string) =>
  date.replace(/^0/, "").replace(/[A-Z]{3}/, (m) => m[0] + m.slice(1).toLowerCase());

/** Hub card for a help category, in the shape the hub grid takes. */
export const categoryCard = (platform: Platform, c: HelpCategory): HubCard => ({
  title: c.title,
  description: `${c.items.length} ${c.items.length === 1 ? "question" : "questions"}`,
  href: `/faqs/${platform}/${c.slug}`,
  image: c.image,
  imageAlt: "",
});
