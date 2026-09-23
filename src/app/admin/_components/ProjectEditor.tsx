"use client";

import { useActionState, useState } from "react";
import type { GroupOption, ProjectInput } from "@/server/siteData";
import { saveProject } from "../actions";
import { FieldEditor } from "./FieldEditor";
import { GalleryField } from "./GalleryField";
import { ImageField } from "./ImageField";
import { buttonClass, Field, inputClass, labelClass, SaveBar, secondaryButtonClass } from "./ui";

export function ProjectEditor({
  id,
  initial,
  groups,
}: {
  id: number | null;
  initial: ProjectInput;
  groups: GroupOption[];
}) {
  const [project, setProject] = useState(initial);
  const [result, action, pending] = useActionState(saveProject, null);
  const update = (changes: Partial<ProjectInput>) => setProject((current) => ({ ...current, ...changes }));
  const group = groups.find((option) => option.id === project.groupId);

  const setDetail = (index: number, value: string) =>
    update({
      meta: project.meta.map((detail, i) => (i === index ? { ...detail, value } : detail)),
    });

  return (
    <form action={action} className="flex flex-col gap-6">
      <input type="hidden" name="id" value={id ?? ""} />
      <input type="hidden" name="data" value={JSON.stringify(project)} />

      <Section title="Card" hint="How the project appears in the grid of project cards.">
        <Field label="Group">
          <select
            value={project.groupId}
            onChange={(event) => update({ groupId: event.target.value })}
            className={inputClass}
          >
            {groups.map((option) => (
              <option key={option.id} value={option.id}>
                {option.heading}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Title" hint="Press Enter to break the title onto a second line on the site.">
          <textarea
            required
            rows={2}
            value={project.title}
            onChange={(event) => update({ title: event.target.value })}
            className={inputClass}
          />
        </Field>
        <Field label="Role" hint="The line under the title, e.g. Management & Contracting.">
          <input
            value={project.role}
            onChange={(event) => update({ role: event.target.value })}
            className={inputClass}
          />
        </Field>
        <ImageField
          label="Cover photo (leave empty for a plain dark card)"
          value={project.coverImage ?? ""}
          removable
          onChange={(src) => update({ coverImage: src || null })}
        />
      </Section>

      <Section
        title="Profile"
        hint={
          group?.hasProfile
            ? "The full section about the project further down the page. Its “Project 01” number follows the order on the Projects page, so reordering renumbers them."
            : "This project's group shows cards only, so the profile isn't displayed on the site. Move it to a group with a profile band heading to show it."
        }
      >
        <Field label="Description">
          <textarea
            rows={4}
            value={project.description}
            onChange={(event) => update({ description: event.target.value })}
            className={inputClass}
          />
        </Field>

        <div className="flex flex-col gap-2">
          <span className={labelClass}>Details</span>
          <p className="text-[12px] text-ink/60">
            The small grid in the project profile. Leave a box empty and that row isn&apos;t shown on
            the site.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {project.meta.map((detail, index) => (
              <Field key={detail.label} label={detail.label}>
                <input
                  value={detail.value}
                  onChange={(event) => setDetail(index, event.target.value)}
                  className={inputClass}
                />
              </Field>
            ))}
          </div>
        </div>

        <FieldEditor
          name="tags"
          value={project.tags}
          template={[""]}
          onChange={(tags) => update({ tags: tags as string[] })}
        />
        <div className="flex flex-col gap-2">
          <span className={labelClass}>Photo shape</span>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              aria-pressed={project.portrait}
              onClick={() => update({ portrait: !project.portrait })}
              className={project.portrait ? buttonClass : secondaryButtonClass}
            >
              {project.portrait ? "Portrait ✓" : "Portrait"}
            </button>
            <p className="text-[13px] text-ink/60">
              {project.portrait
                ? "This project's photos are shown in tall frames."
                : "Turn this on when the photos are taller than they are wide, so they aren't cropped."}
            </p>
          </div>
        </div>

        <GalleryField value={project.gallery} onChange={(gallery) => update({ gallery })} />
      </Section>

      <SaveBar pending={pending} result={result} label={id ? "Save project" : "Create project"} />
    </form>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-5 border border-ink/10 bg-white p-5">
      <div>
        <h2 className="text-[20px] font-bold text-primary">{title}</h2>
        {hint && <p className="mt-1 text-[13px] text-ink/60">{hint}</p>}
      </div>
      {children}
    </section>
  );
}
