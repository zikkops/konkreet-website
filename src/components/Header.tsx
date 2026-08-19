"use client";

import { useState } from "react";
import { navItems } from "@/data/content";

const anchorFor = (item: string) => `#${item.toLowerCase()}`;

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[rgba(245,243,235,0.92)] backdrop-blur-sm">
      <div className="flex h-[70px] items-center justify-between px-[var(--gutter-wide)]">
        <a href="#top" className="flex items-center" aria-label="Konkreet home">
          <span className="flex size-[50px] shrink-0 items-center justify-center border-2 border-primary-tint text-[20px] font-bold text-primary">
            K
          </span>
          <span className="flex flex-col justify-center pl-[10px]">
            <span className="text-[16px] font-bold tracking-[0.24em] text-primary">
              KONKREET
            </span>
            <span className="text-[10px] tracking-[0.17em] text-copper">
              Engineering &amp; Contracting
            </span>
          </span>
        </a>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-8">
            {navItems.map((item) => (
              <li key={item}>
                <a
                  href={anchorFor(item)}
                  className="text-[12px] uppercase text-primary transition-colors duration-300 hover:text-copper"
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label="Menu Toggle"
          onClick={() => setOpen((v) => !v)}
          className="flex size-10 items-center justify-center text-primary md:hidden"
        >
          <svg viewBox="0 0 1000 1000" className="size-5 fill-current" aria-hidden="true">
            {open ? (
              <path d="M742 167L500 408 258 167C246 154 233 150 217 150 196 150 179 158 167 167 154 179 150 196 150 212 150 229 154 242 171 254L408 500 167 742C138 771 138 800 167 829 196 858 225 858 254 829L496 587 738 829C750 842 767 846 783 846 800 846 817 842 829 829 842 817 846 804 846 783 846 767 842 750 829 737L588 500 833 258C863 229 863 200 833 171 804 137 775 137 742 167Z" />
            ) : (
              <path d="M104 333H896C929 333 958 304 958 271S929 208 896 208H104C71 208 42 237 42 271S71 333 104 333ZM104 583H896C929 583 958 554 958 521S929 458 896 458H104C71 458 42 487 42 521S71 583 104 583ZM104 833H896C929 833 958 804 958 771S929 708 896 708H104C71 708 42 737 42 771S71 833 104 833Z" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <nav
          id="mobile-menu"
          aria-label="Primary"
          className="border-t border-hairline px-[var(--gutter-wide)] pb-4 md:hidden"
        >
          <ul className="flex flex-col">
            {navItems.map((item) => (
              <li key={item}>
                <a
                  href={anchorFor(item)}
                  onClick={() => setOpen(false)}
                  className="block py-3 text-[12px] uppercase tracking-[0.12em] text-primary"
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
