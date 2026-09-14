import { Eyebrow } from "./Eyebrow";
import { CmsImage } from "./CmsImage";
import type { SiteContent } from "@/data/content";

export function Method({ method, imageBand }: Pick<SiteContent, "method" | "imageBand">) {
  return (
    <>
      <section
        id="method"
        className="flex flex-col gap-[30px] bg-primary px-[var(--gutter)] py-[var(--section-y)]"
      >
        <Eyebrow tone="cream">{method.eyebrow}</Eyebrow>

        <h2 className="display text-[clamp(38px,5.5vw,62px)] text-white">
          {method.title}
        </h2>

        <p className="whitespace-pre-line text-[18px] text-on-dark">
          {method.lead}
        </p>

        <ol className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
          {method.phases.map((phase) => (
            <li
              key={phase.label}
              className="flex flex-col gap-5 border border-primary-tint bg-white/6 px-7 pt-[34px] pb-[42px]"
            >
              <h3 className="eyebrow font-bold text-copper">{phase.label}</h3>
              <h4 className="display mt-[30px] text-[24px] text-white">
                {phase.title}
              </h4>
              <p className="mb-[50px] whitespace-pre-line text-[14px] text-on-dark">
                {phase.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* Full-bleed image band separating method from expertise. */}
      <div className="flex h-[300px] flex-row lg:h-[500px]">
        {imageBand.filter((image) => image.src).map((image) => (
          <div key={image.src} className="relative" style={{ width: image.width }}>
            <CmsImage
              src={image.src}
              alt={image.alt}
              fill
              /* The panels are flex-basis 50/30/40, so each settles at its
                 share of 120% of the row. */
              sizes={`${Math.round(parseInt(image.width, 10) / 1.2)}vw`}
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </>
  );
}
