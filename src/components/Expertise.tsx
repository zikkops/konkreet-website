import { Eyebrow } from "./Eyebrow";
import type { SiteContent } from "@/data/content";

export function Expertise({ expertise }: Pick<SiteContent, "expertise">) {
  return (
    <section
      id="expertise"
      className="flex flex-col gap-[30px] px-[var(--gutter)] py-[var(--section-y)] lg:flex-row"
    >
      <div className="flex flex-col gap-5 lg:w-1/2">
        <Eyebrow>{expertise.eyebrow}</Eyebrow>

        <h2 className="display text-[clamp(38px,5.5vw,62px)] tracking-[-0.055em] text-primary">
          {expertise.titleLines.map((line, index) => (
            <span key={line}>
              {index > 0 && <br />}
              {line}
            </span>
          ))}
        </h2>

        <p className="max-w-[600px] text-[18px] text-primary-tint">
          {expertise.lead}
        </p>
      </div>

      {/* 12 numbered cells laid out 3-up, hairline-separated like the source. */}
      <ol className="grid grid-cols-2 sm:grid-cols-3 lg:w-1/2">
        {expertise.items.map((item, index) => (
          <li
            key={item}
            className="flex flex-col border-[0.5px] border-ink/27 bg-white p-6"
          >
            <span className="eyebrow font-bold text-copper">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-[30px] text-[12px] font-bold leading-[1.15] text-primary">
              {item}
            </h3>
          </li>
        ))}
      </ol>
    </section>
  );
}
