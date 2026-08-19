import { Eyebrow } from "./Eyebrow";
import { hero, stats } from "@/data/content";

export function Hero() {
  return (
    <>
      <section
        id="top"
        className="flex flex-col gap-10 bg-cover bg-center px-[var(--gutter)] py-[var(--section-y)] lg:flex-row lg:gap-5"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(23,73,81,.96) 0%, rgba(23,74,82,0.64) 46%, #f5f3eb 92%), url('${hero.background}')`,
        }}
      >
        {/* p-[10px]: this column keeps the container default padding in the
            source, which is what narrows the headline to five lines. */}
        <div className="flex flex-col gap-[30px] p-[10px] lg:w-1/2">
          <Eyebrow tone="cream">{hero.eyebrow}</Eyebrow>

          {/* Three explicit lines (the source's <br>s); each still wraps on
              its own, which is what produces five lines at desktop width. */}
          <h1 className="display text-[clamp(48px,6.5vw,94px)] font-black text-white">
            {hero.titleLines.map((line, index) => (
              <span key={line}>
                {index > 0 && <br />}
                {line}
              </span>
            ))}
          </h1>

          <p className="max-w-[600px] text-[18px] text-on-dark">{hero.lead}</p>

          <div className="flex flex-wrap gap-5">
            <a
              href="#projects"
              className="rounded-[2px] border border-copper bg-copper px-6 py-3 text-[12px] font-bold text-white transition-colors duration-300 hover:border-white/15 hover:bg-transparent"
            >
              {hero.primaryCta}
            </a>
            <a
              href="#method"
              className="rounded-[2px] border border-white/25 px-6 py-3 text-[12px] font-bold text-white transition-colors duration-300 hover:border-copper hover:bg-copper"
            >
              {hero.secondaryCta}
            </a>
          </div>
        </div>

        <div className="flex items-end lg:w-1/2">
          <blockquote className="flex w-full flex-col gap-5 border-l-[6px] border-copper bg-panel p-[34px]">
            <p className="text-[28px] font-bold text-ink">{hero.quote}</p>
            <p className="max-w-[600px] text-[16px] text-ink">{hero.quoteBody}</p>
          </blockquote>
        </div>
      </section>

      {/* Stat strip, pulled up so it overlaps the base of the hero. */}
      <section className="-mt-[67px] px-[var(--gutter)]">
        <dl className="grid grid-cols-2 bg-white lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col gap-[10px] border-[0.5px] border-black/8 px-7 py-8"
            >
              <dt className="display text-[34px] text-primary">{stat.value}</dt>
              <dd className="text-[11px] font-bold uppercase tracking-[0.13em] text-primary">
                {stat.label}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
