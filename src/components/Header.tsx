import Image from "next/image";
import Link from "next/link";
import { header } from "@/lib/content";
import s from "./Header.module.css";

export default function Header() {
  return (
    <header className={s.header}>
      <div className={s.pill}>
        <Link href="/" aria-label="Equal AI home">
          <Image
            src={header.logo.src}
            alt={header.logo.alt}
            width={header.logo.width}
            height={header.logo.height}
            quality={90}
            className={s.logo}
          />
        </Link>

        <nav aria-label="Primary" className={s.nav}>
          {header.links.map((link) => (
            <Link key={link.label} href={link.href} className={s.link}>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* <1024px: same links behind a JS-free disclosure menu */}
        <details className={s.menu}>
          <summary className={s.menuButton} aria-label={header.menuLabel}>
            <span className={s.menuBar} />
            <span className={s.menuBar} />
            <span className={s.menuBar} />
          </summary>
          <nav aria-label="Primary (mobile)" className={s.menuPanel}>
            {header.links.map((link) => (
              <Link key={link.label} href={link.href} className={s.link}>
                {link.label}
              </Link>
            ))}
          </nav>
        </details>
      </div>
    </header>
  );
}
