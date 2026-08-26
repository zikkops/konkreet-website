import { Eyebrow } from "./Eyebrow";
import {
  profileSlug,
  profiles,
  projectGroups,
  projectsIntro,
  type ProjectCard,
} from "@/data/content";

// Only the cards that have a profile section further down the page can be
// pressed; the "additional experience" entries have nowhere to go.
const linkable = new Set(profiles.map((profile) => profile.title));

function Card({ card }: { card: ProjectCard }) {
  const href = linkable.has(card.title) ? `#${profileSlug(card.title)}` : null;

  const body = (
    <>
      <h4 className="display whitespace-pre-line text-[22px] text-white transition-colors group-hover:text-copper">
        {card.title}
      </h4>
      <p className="text-[12px] font-bold uppercase leading-[0.92] tracking-[0.12em] text-on-dark">
        {card.role}
      </p>
    </>
  );

  // Cards with an image get the dark gradient scrim; the "additional
  // experience" entries are short solid-ink bars in the source.
  const inner = "flex flex-1 flex-col justify-end gap-5 p-5";
  const content = href ? (
    <a
      href={href}
      className={`${inner} outline-offset-[-2px] focus-visible:outline-2 focus-visible:outline-copper`}
      aria-label={`${card.title} — see project profile`}
    >
      {body}
    </a>
  ) : (
    <div className={inner}>{body}</div>
  );

  if (!card.image) {
    return <li className="group flex min-h-[60px] flex-col bg-ink">{content}</li>;
  }

  return (
    <li
      className="group flex min-h-[260px] flex-col bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.69) 100%), url('${card.image}')`,
      }}
    >
      {content}
    </li>
  );
}

export function ProjectsIndex() {
  return (
    <section
      id="projects"
      className="flex flex-col gap-5 bg-cream px-[var(--gutter)] py-[var(--section-y)]"
    >
      <Eyebrow>{projectsIntro.eyebrow}</Eyebrow>

      <h2 className="display text-[clamp(38px,5.5vw,62px)] tracking-normal text-primary">
        {projectsIntro.title}
      </h2>

      {projectGroups.map((group, index) => (
        <div key={group.heading} className="flex flex-col gap-5">
          {index > 0 && (
            <h3 className="display mt-10 text-[clamp(38px,5.5vw,62px)] tracking-normal text-primary">
              {group.heading}
            </h3>
          )}

          <p className="max-w-[600px] text-[18px] text-primary-tint">
            {group.intro}
          </p>

          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {group.cards.map((card) => (
              <Card key={`${group.heading}-${card.title}`} card={card} />
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
