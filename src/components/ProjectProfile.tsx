import { galleryCaption, type Profile } from "@/data/content";

/** One project profile: a two-column photo grid on the left, the spec card on the right. */
export function ProjectProfile({ profile }: { profile: Profile }) {
  const half = Math.ceil(profile.gallery.length / 2);
  const columns = [profile.gallery.slice(0, half), profile.gallery.slice(half)];

  return (
    <section className="flex flex-col gap-[30px] px-[var(--gutter)] py-[var(--section-y)] lg:flex-row">
      <div className="flex flex-col gap-5 lg:w-1/2">
        <div className="flex gap-[14px]">
          {columns.map((column, columnIndex) => (
            <div key={columnIndex} className="flex flex-1 flex-col gap-[14px]">
              {column.map((src) => (
                <div
                  key={src}
                  role="img"
                  aria-label={`${profile.title} — site photograph`}
                  className="min-h-[204px] bg-cover bg-center"
                  style={{ backgroundImage: `url('${src}')` }}
                />
              ))}
            </div>
          ))}
        </div>

        <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-ink/58">
          {galleryCaption}
        </p>
      </div>

      <div className="flex flex-col justify-end pb-5 lg:w-1/2">
        <article className="flex flex-col gap-5 border-t-[6px] border-copper bg-white p-8 lg:p-[52px]">
          <h3 className="eyebrow font-bold text-copper">{profile.label}</h3>

          <h4 className="display whitespace-pre-line text-[clamp(32px,4.5vw,62px)] tracking-[-0.055em] text-primary">
            {profile.title}
          </h4>

          <p className="max-w-[600px] text-[17px] text-primary-tint">
            {profile.description}
          </p>

          <dl className="grid grid-cols-1 sm:grid-cols-2">
            {profile.meta.map((entry) => (
              <div
                key={entry.label}
                className="flex flex-col gap-[10px] border border-ink/11 p-[18px]"
              >
                <dt className="text-[10px] font-bold uppercase tracking-[0.22em] text-copper">
                  {entry.label}
                </dt>
                <dd className="text-[14px] font-bold leading-[0.92] text-primary">
                  {entry.value}
                </dd>
              </div>
            ))}
          </dl>

          {/* Two rows of two equal-width tags, as in the source. */}
          <ul className="grid grid-cols-2 gap-[10px]">
            {profile.tags.map((tag) => (
              <li
                key={tag}
                className="bg-primary/12 px-[14px] py-3 text-[14px] font-bold leading-[0.92] text-primary"
              >
                {tag}
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}

/** Full-width teal band that introduces each group of profiles. */
export function ProfileBand({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-primary p-10">
      <h2 className="display text-center text-[clamp(34px,5.5vw,62px)] tracking-[-0.055em] text-white">
        {children}
      </h2>
    </div>
  );
}

/** Hairline rule between consecutive profiles. */
export function ProfileDivider() {
  return (
    <div className="px-[var(--gutter)]">
      <hr className="h-px border-0 bg-hairline" />
    </div>
  );
}
