import { Eyebrow } from "./Eyebrow";
import { projectGroups, projectsIntro, type ProjectCard } from "@/data/content";

function Card({ card }: { card: ProjectCard }) {
  // Cards with an image get the dark gradient scrim; the "additional
  // experience" entries are short solid-ink bars in the source.
  if (!card.image) {
    return (
      <li className="flex min-h-[60px] flex-col justify-end gap-5 bg-ink p-5">
        <h4 className="display whitespace-pre-line text-[22px] text-white">{card.title}</h4>
        <p className="text-[12px] font-bold uppercase leading-[0.92] tracking-[0.12em] text-on-dark">
          {card.role}
        </p>
      </li>
    );
  }

  return (
    <li
      className="flex min-h-[260px] flex-col justify-end gap-5 bg-cover bg-center p-5"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.69) 100%), url('${card.image}')`,
      }}
    >
      <h4 className="display whitespace-pre-line text-[22px] text-white">{card.title}</h4>
      <p className="text-[12px] font-bold uppercase leading-[0.92] tracking-[0.12em] text-on-dark">
        {card.role}
      </p>
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
