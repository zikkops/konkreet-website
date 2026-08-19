import { Eyebrow } from "./Eyebrow";
import { closing, contact, footer } from "@/data/content";

export function Closing() {
  return (
    <>
      <section
        id="contact"
        className="flex flex-col gap-10 bg-cover bg-center px-[var(--gutter-wide)] py-[115px] lg:flex-row lg:gap-0"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(23,74,82,1) 0%, rgba(23,74,82,0.74) 100%), url('${closing.background}')`,
        }}
      >
        <div className="flex flex-col justify-center gap-5 lg:w-1/2">
          <Eyebrow tone="cream">{closing.eyebrow}</Eyebrow>
          <p className="display text-[clamp(34px,5.5vw,62px)] tracking-[-0.055em] text-white">
            {closing.quote}
          </p>
        </div>

        <div className="flex flex-col gap-5 border-t-[6px] border-copper bg-cream p-9 lg:w-1/2">
          <h2 className="display text-[26px] text-primary">{contact.heading}</h2>

          <dl>
            {contact.rows.map((row) => (
              <div
                key={row.label}
                className="flex items-center border-b border-black/25 pb-[10px] not-last:mb-5"
              >
                <dt className="w-[100px] shrink-0 text-[11px] font-bold uppercase text-copper">
                  {row.label}
                </dt>
                <dd className="text-ink">
                  {row.href ? (
                    <a href={row.href} className="underline-offset-4 hover:underline">
                      {row.value}
                    </a>
                  ) : (
                    row.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <footer className="flex flex-col gap-2 bg-primary px-[var(--gutter-wide)] py-7 text-on-dark sm:flex-row sm:justify-between">
        <p>{footer.left}</p>
        <p>{footer.right}</p>
      </footer>
    </>
  );
}
