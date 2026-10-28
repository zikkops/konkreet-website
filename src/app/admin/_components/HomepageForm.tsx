"use client";

import { useActionState, useState } from "react";
import type { PageContent } from "@/server/siteData";
import { saveHomepage } from "../actions";
import { FieldEditor } from "./FieldEditor";
import type { ImageSize } from "./ImageField";
import { SaveBar, Section } from "./ui";

type Key = keyof PageContent;

// The page from top to bottom. A section with one part shows its fields
// directly; one with several labels each part.
const SECTIONS: { title: string; hint: string; keys: Key[] }[] = [
  {
    title: "Top of the page",
    hint: "The headline over the large photo, the quote box beside it, and the strip of numbers below.",
    keys: ["hero", "stats"],
  },
  { title: "About", hint: "The text and the two photos about Mario Zgheib.", keys: ["about"] },
  { title: "Method", hint: "The dark teal section with the execution phases.", keys: ["method"] },
  {
    title: "Photo strip",
    hint: "The row of photos under the method phases, left to right. The widths share out the row: 50% + 30% + 40% is how it was designed.",
    keys: ["imageBand"],
  },
  { title: "Areas of expertise", hint: "The heading and the list of expertise areas.", keys: ["expertise"] },
  {
    title: "Projects",
    hint: "The heading over the project groups. The groups and the projects themselves are edited on the Projects page.",
    keys: ["projectsIntro", "galleryCaption"],
  },
  {
    title: "Contact and footer",
    hint: "The closing statement over the last photo, the contact details beside it, and the footer line. Change a phone number or email and its link updates with it.",
    keys: ["closing", "contact", "footer"],
  },
];

const FULL_WIDTH: ImageSize = {
  width: 1920,
  height: 1080,
  note: "It fills the width of the screen and is cropped to fit, so keep the subject near the middle.",
};

const FIXED_SIZES: Record<string, ImageSize> = {
  "hero.background": { ...FULL_WIDTH, note: `${FULL_WIDTH.note} A teal tint is laid over it.` },
  "about.primaryImage": { width: 820, height: 940, note: "Shown 407 × 470 px on desktop." },
  "about.insetImage": { width: 500, height: 580, note: "Shown 244 × 284 px on desktop; hidden on phones." },
  "closing.background": { ...FULL_WIDTH, note: `${FULL_WIDTH.note} A teal tint is laid over it.` },
};

// Twice the size the strip shows a photo on a 1920 px wide screen, so it stays
// sharp on high-resolution displays. The strip is 500 px tall there, and each
// photo gets its width's share of the row.
function stripSizes(band: PageContent["imageBand"]): Record<string, ImageSize> {
  const shown = band.filter((image) => image.src);
  const total = shown.reduce((sum, image) => sum + (parseFloat(image.width) || 0), 0) || 1;
  return Object.fromEntries(
    band.map((image, index) => {
      const width = Math.round((2 * 1920 * (parseFloat(image.width) || 0)) / total / 10) * 10;
      return [
        `imageBand.${index}.src`,
        { width: width || 1000, height: 1000, note: "Shown 500 px tall on desktop and cropped to fit its width." },
      ];
    }),
  );
}

export function HomepageForm({ initial, template }: { initial: PageContent; template: PageContent }) {
  const [page, setPage] = useState(initial);
  const [result, action, pending] = useActionState(saveHomepage, null);
  const sizes = { ...FIXED_SIZES, ...stripSizes(page.imageBand) };

  return (
    <form action={action} className="flex flex-col gap-6">
      <input type="hidden" name="data" value={JSON.stringify(page)} />

      {SECTIONS.map((section) => (
        <Section key={section.title} title={section.title} hint={section.hint}>
          {section.keys.map((key) => (
            <FieldEditor
              key={key}
              name={key}
              value={page[key]}
              template={template[key]}
              hideLabel={section.keys.length === 1}
              sizes={sizes}
              onChange={(value) => setPage((current) => ({ ...current, [key]: value }))}
            />
          ))}
        </Section>
      ))}

      <SaveBar pending={pending} result={result} label="Save homepage" />
    </form>
  );
}
