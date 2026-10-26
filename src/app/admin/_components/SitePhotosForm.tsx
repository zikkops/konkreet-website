"use client";

import { useActionState, useState } from "react";
import type { SitePhotos } from "@/server/siteData";
import { saveSitePhotos } from "../actions";
import { ImageField } from "./ImageField";
import { Field, inputClass, SaveBar, Section } from "./ui";

export function SitePhotosForm({ initial }: { initial: SitePhotos }) {
  const [photos, setPhotos] = useState(initial);
  const [result, action, pending] = useActionState(saveSitePhotos, null);
  const update = (changes: Partial<SitePhotos>) => setPhotos((current) => ({ ...current, ...changes }));
  const setBand = (index: number, changes: Partial<SitePhotos["band"][number]>) =>
    update({ band: photos.band.map((image, i) => (i === index ? { ...image, ...changes } : image)) });

  return (
    <form action={action} className="flex flex-col gap-6">
      <input type="hidden" name="data" value={JSON.stringify(photos)} />

      <Section title="Top of the page" hint="The large photo behind the headline, shown under a teal tint.">
        <ImageField
          label="Background photo"
          value={photos.heroBackground}
          onChange={(heroBackground) => update({ heroBackground })}
        />
      </Section>

      <Section title="About" hint="The tall photo beside the About text, and the smaller framed one overlapping it.">
        <ImageField
          label="Main photo (portrait)"
          value={photos.aboutPrimary}
          onChange={(aboutPrimary) => update({ aboutPrimary })}
        />
        <ImageField
          label="Framed photo (portrait, hidden on phones)"
          value={photos.aboutInset}
          onChange={(aboutInset) => update({ aboutInset })}
        />
      </Section>

      <Section title="Photo strip" hint="The row of photos between the method phases and Areas of Expertise, left to right.">
        {photos.band.map((image, index) => (
          <div key={index} className="flex flex-col gap-3 border-t border-ink/10 pt-5 first:border-t-0 first:pt-0">
            <ImageField
              label={`Photo ${index + 1}`}
              value={image.src}
              onChange={(src) => setBand(index, { src })}
            />
            <Field label="Description" hint="What the photo shows, read out to visitors who can't see it.">
              <input
                value={image.alt}
                onChange={(event) => setBand(index, { alt: event.target.value })}
                className={inputClass}
              />
            </Field>
          </div>
        ))}
      </Section>

      <Section title="Contact" hint="The photo behind the closing section with the contact details.">
        <ImageField
          label="Background photo"
          value={photos.closingBackground}
          onChange={(closingBackground) => update({ closingBackground })}
        />
      </Section>

      <SaveBar pending={pending} result={result} label="Save photos" />
    </form>
  );
}
