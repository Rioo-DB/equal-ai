import type { Metadata } from "next";
import Shell from "@/components/resources/Shell";
import { PageIntro } from "@/components/resources/parts";
import { termsPage } from "@/lib/resources";
import s from "@/components/resources/Resources.module.css";

export const metadata: Metadata = {
  title: "Terms and Conditions — Equal AI",
  description: "The terms that govern your use of the Equal AI assistant and its services.",
};

const anchor = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
// "About Equal AI and Services:" -> "About Equal AI and Services"
const label = (t: string) => t.replace(/:\s*$/, "");

export default function TermsPage() {
  const titled = termsPage.sections.filter((x): x is { title: string; body: string } => !!x.title);

  return (
    <Shell>
      <PageIntro title={termsPage.title} eyebrow={termsPage.effective} />

      <div className={s.policy}>
        <nav className={`${s.glass} ${s.toc}`} aria-label="On this page">
          <p className={s.tocTitle}>On this page</p>
          <ol className={s.tocList}>
            {titled.map((sec) => (
              <li key={sec.title}>
                <a href={`#${anchor(sec.title)}`}>{label(sec.title)}</a>
              </li>
            ))}
          </ol>
        </nav>

        <div>
          {termsPage.sections.map((sec, i) => (
            <section key={i} id={sec.title ? anchor(sec.title) : undefined} className={s.policySection}>
              {sec.title && <h2 className={s.policyTitle}>{label(sec.title)}</h2>}
              <div className={s.prose} dangerouslySetInnerHTML={{ __html: sec.body }} />
            </section>
          ))}
        </div>
      </div>
    </Shell>
  );
}
