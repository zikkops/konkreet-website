"use client";

import { useActionState } from "react";
import type { GroupSettings } from "@/server/siteData";
import { saveGroup } from "../actions";
import { buttonClass, Field, inputClass } from "./ui";

/** Edits one group's wording right where the group is shown. */
export function GroupHeadingsForm({ group }: { group: GroupSettings }) {
  const [result, action, pending] = useActionState(saveGroup, null);

  return (
    <details className="border border-ink/10 bg-white">
      <summary className="cursor-pointer px-4 py-2 text-[13px] font-bold text-primary hover:text-copper">
        Edit this group&apos;s heading and intro
      </summary>
      <form action={action} className="flex flex-col gap-4 border-t border-ink/10 p-4">
        <input type="hidden" name="groupId" value={group.id} />

        <Field label="Heading" hint="The title above this grid of project cards.">
          <input name="heading" defaultValue={group.heading} className={inputClass} />
        </Field>
        <Field label="Intro" hint="The paragraph under the heading.">
          <textarea name="intro" rows={3} defaultValue={group.intro} className={inputClass} />
        </Field>
        <Field
          label="Profile band heading"
          hint="The wide teal band above this group's full project profiles. Leave it empty to show the cards only."
        >
          <input name="profileHeading" defaultValue={group.profileHeading} className={inputClass} />
        </Field>

        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" disabled={pending} className={buttonClass}>
            {pending ? "Saving…" : "Save headings"}
          </button>
          {result && (
            <p role="status" className={`text-[14px] ${result.ok ? "text-green-700" : "text-red-700"}`}>
              {result.message}
            </p>
          )}
        </div>
      </form>
    </details>
  );
}
