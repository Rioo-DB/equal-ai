import type { Metadata } from "next";
import Shell from "@/components/resources/Shell";
import { PageIntro } from "@/components/resources/parts";
import { privacyPolicy } from "@/lib/resources";
import s from "@/components/resources/Resources.module.css";

export const metadata: Metadata = {
  title: "Privacy Policy — Equal AI",
  description: "What we collect, why we need it and what you can ask us to do with it.",
};

// "3. SPECIFIC PERMISSIONS THAT ..." -> "3. Specific permissions that ..."
const sentenceCase = (t: string) => t.charAt(0) + t.slice(1).toLowerCase().replace(/\bai\b/g, "AI");
const anchor = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function PrivacyPage() {
  const titled = privacyPolicy.sections.filter((x): x is { title: string; body: string } => !!x.title);

  return (
    <Shell>
      <PageIntro title="Privacy Policy" eyebrow={privacyPolicy.effective} />

      <div className={s.policy}>
        <nav className={`${s.glass} ${s.toc}`} aria-label="On this page">
          <p className={s.tocTitle}>On this page</p>
          <ol className={s.tocList}>
            {titled.map((sec) => (
              <li key={sec.title}>
                <a href={`#${anchor(sec.title)}`}>{sentenceCase(sec.title)}</a>
              </li>
            ))}
          </ol>
        </nav>

        <div>
          {privacyPolicy.sections.map((sec, i) => (
            <section key={i} id={sec.title ? anchor(sec.title) : undefined} className={s.policySection}>
              {sec.title && <h2 className={s.policyTitle}>{sentenceCase(sec.title)}</h2>}
              <div className={s.prose} dangerouslySetInnerHTML={{ __html: sec.body }} />
            </section>
          ))}
        </div>
      </div>
    </Shell>
  );
}
