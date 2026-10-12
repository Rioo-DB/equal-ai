import type { Metadata } from "next";
import Image from "next/image";
import Shell from "@/components/resources/Shell";
import { PageIntro } from "@/components/resources/parts";
import { releases } from "@/lib/resources";
import s from "@/components/resources/Resources.module.css";

export const metadata: Metadata = {
  title: "Updates — Equal AI",
  description: releases.lede,
};

export default function UpdatesPage() {
  return (
    <Shell>
      <PageIntro title={releases.title} lede={releases.lede} />

      <div className={s.timeline}>
        {releases.groups.map((group) => (
          <section key={group.month} className={s.release} aria-label={group.month}>
            <div className={s.releaseHead}>
              <h2 className={s.releaseMonth}>{group.month}</h2>
              <span className={s.releaseCount}>
                {group.items.length} {group.items.length === 1 ? "update" : "updates"}
              </span>
              <span className={s.releaseRule} aria-hidden="true" />
            </div>

            <ul className={s.releaseList}>
              {group.items.map((item) => (
                <li key={item.title} className={`${s.glass} ${s.update} ${item.media ? "" : s.noMedia}`}>
                  <div>
                    <h3 className={s.updateTitle}>{item.title}</h3>
                    <span className={s.updateDate}>{item.date}</span>
                    <div className={s.prose} dangerouslySetInnerHTML={{ __html: item.body }} />
                  </div>
                  {item.media && (
                    <div className={s.updateMedia}>
                      <Image
                        src={item.media}
                        alt={`${item.title} in the Equal AI app`}
                        fill
                        sizes="220px"
                        // Animated GIFs lose their animation through the optimiser.
                        unoptimized={item.media.endsWith(".gif")}
                      />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Shell>
  );
}
