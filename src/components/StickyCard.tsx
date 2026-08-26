"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Holds the spec card at the vertical centre of the viewport while the taller
 * photo column scrolls past, then releases it at the bottom of the section.
 * The offset has to be measured: `position: sticky` can only pin to an edge,
 * so centring means feeding it `(viewport - card) / 2` as its top.
 */
export function StickyCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [top, setTop] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    /* Cards taller than the viewport clamp to 0 and pin to the top instead. */
    const measure = () =>
      setTop(Math.max(0, (window.innerHeight - node.offsetHeight) / 2));

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <div ref={ref} className="lg:sticky" style={{ top }}>
      {children}
    </div>
  );
}
