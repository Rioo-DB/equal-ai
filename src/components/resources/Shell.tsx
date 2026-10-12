import type { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import s from "./Resources.module.css";

/**
 * Page chrome for every Resources page: the home page's glass header and
 * footer around a black page with a soft green wash at the top.
 */
export default function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="page">
      <div className={`frame ${s.frame}`}>
        <div className={s.topGlow} aria-hidden="true" />
        <Header />
        <main className={s.main}>{children}</main>
        <Footer />
      </div>
    </div>
  );
}
