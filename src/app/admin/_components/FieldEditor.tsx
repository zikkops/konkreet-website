"use client";

import { ImageField } from "./ImageField";
import { dangerButtonClass, Field, inputClass, labelClass, secondaryButtonClass } from "./ui";

// Edits any part of the page settings, driven by the shape of a template
// value: strings become inputs, arrays become add/remove/reorder lists, and
// objects become groups of fields.

const IMAGE_KEYS = new Set(["background", "primaryImage", "insetImage", "src"]);
const LONG_KEYS = new Set(["lead", "quoteBody", "intro", "body", "description", "paragraphs"]);
const HIDDEN_KEYS = new Set(["id"]);

const LABELS: Record<string, string> = {
  eyebrow: "Small heading",
  titleLines: "Title lines",
  primaryCta: "Main button text",
  secondaryCta: "Second button text",
  quoteBody: "Quote text",
  primaryImage: "Main photo",
  insetImage: "Small inset photo",
  paragraphs: "Paragraphs (the first two are shown, either side of the copper line)",
  background: "Background photo",
  src: "Photo",
  alt: "Photo description (read out by screen readers)",
  width: "Width (share of the row, e.g. 50%)",
  profileHeading: "Profile band heading (leave empty to show cards only)",
  href: "Link (optional, e.g. tel:+96171881155 or mailto:info@konkreet.co)",
  left: "Left text",
  right: "Right text",
  meta: "Details (e.g. Role, Developer, Architect, Location)",
};

const SINGULAR: Record<string, string> = {
  stats: "stat",
  phases: "phase",
  imageBand: "photo",
  groups: "group",
  rows: "row",
  titleLines: "line",
  paragraphs: "paragraph",
  competencies: "competency",
  items: "item",
  meta: "detail",
  tags: "tag",
};

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

export const labelFor = (key: string) =>
  LABELS[key] ?? capitalize(key.replace(/([A-Z])/g, " $1").toLowerCase());

const newId = () => crypto.randomUUID().slice(0, 8);

/** An empty value in the template's shape, for a newly added list item. */
function blank(template: unknown): unknown {
  if (typeof template === "string") return "";
  if (Array.isArray(template)) return [];
  if (template && typeof template === "object") {
    return Object.fromEntries(
      Object.entries(template).map(([key, value]) => [key, key === "id" ? newId() : blank(value)]),
    );
  }
  return template;
}

type EditorProps = {
  name: string;
  value: unknown;
  template: unknown;
  onChange: (value: unknown) => void;
  hideLabel?: boolean;
};

export function FieldEditor({ name, value, template, onChange, hideLabel }: EditorProps) {
  const label = hideLabel ? null : labelFor(name);

  if (Array.isArray(template)) {
    const itemTemplate =
      typeof template[0] === "object" ? Object.assign({}, ...template) : (template[0] ?? "");
    return (
      <ListEditor
        name={name}
        label={label}
        items={Array.isArray(value) ? value : []}
        itemTemplate={itemTemplate}
        onChange={onChange}
      />
    );
  }

  if (template && typeof template === "object") {
    const current = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
    const fields = Object.entries(template)
      .filter(([key]) => !HIDDEN_KEYS.has(key))
      .map(([key, fieldTemplate]) => (
        <FieldEditor
          key={key}
          name={key}
          value={current[key]}
          template={fieldTemplate}
          onChange={(next) => onChange({ ...current, [key]: next })}
        />
      ));
    if (!label) return <div className="flex flex-col gap-4">{fields}</div>;
    return (
      <fieldset className="flex flex-col gap-4 border-l-2 border-copper/40 pl-4">
        <legend className={`${labelClass} mb-2`}>{label}</legend>
        {fields}
      </fieldset>
    );
  }

  const text = typeof value === "string" ? value : "";
  if (IMAGE_KEYS.has(name)) {
    return <ImageField label={label ?? labelFor(name)} value={text} onChange={onChange} />;
  }

  const long = LONG_KEYS.has(name) || text.includes("\n") || text.length > 80;
  const control = long ? (
    <textarea
      value={text}
      rows={Math.min(8, Math.max(3, Math.ceil(text.length / 70)))}
      aria-label={label ? undefined : labelFor(name)}
      onChange={(event) => onChange(event.target.value)}
      className={inputClass}
    />
  ) : (
    <input
      value={text}
      aria-label={label ? undefined : labelFor(name)}
      onChange={(event) => onChange(event.target.value)}
      className={inputClass}
    />
  );
  return label ? <Field label={label}>{control}</Field> : control;
}

function ListEditor({
  name,
  label,
  items,
  itemTemplate,
  onChange,
}: {
  name: string;
  label: string | null;
  items: unknown[];
  itemTemplate: unknown;
  onChange: (value: unknown[]) => void;
}) {
  const singular = SINGULAR[name] ?? "item";
  const isGroup = Boolean(itemTemplate) && typeof itemTemplate === "object";

  const replace = (index: number, next: unknown) =>
    onChange(items.map((item, i) => (i === index ? next : item)));
  const move = (index: number, step: number) => {
    const next = [...items];
    [next[index], next[index + step]] = [next[index + step], next[index]];
    onChange(next);
  };
  const remove = (index: number) => onChange(items.filter((_, i) => i !== index));

  return (
    <div className="flex flex-col gap-2">
      {label && <span className={labelClass}>{label}</span>}

      {items.map((item, index) => {
        const controls = (
          <div className="flex shrink-0 gap-1">
            <button
              type="button"
              aria-label={`Move ${singular} up`}
              disabled={index === 0}
              onClick={() => move(index, -1)}
              className={secondaryButtonClass}
            >
              ↑
            </button>
            <button
              type="button"
              aria-label={`Move ${singular} down`}
              disabled={index === items.length - 1}
              onClick={() => move(index, 1)}
              className={secondaryButtonClass}
            >
              ↓
            </button>
            <button
              type="button"
              aria-label={`Remove ${singular}`}
              onClick={() => remove(index)}
              className={dangerButtonClass}
            >
              ✕
            </button>
          </div>
        );
        const editor = (
          <FieldEditor
            name={isGroup ? singular : name}
            value={item}
            template={itemTemplate}
            hideLabel
            onChange={(next) => replace(index, next)}
          />
        );

        return isGroup ? (
          <div key={index} className="flex flex-col gap-4 border border-ink/10 bg-cream/50 p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[13px] font-bold text-primary">
                {capitalize(singular)} {index + 1}
              </span>
              {controls}
            </div>
            {editor}
          </div>
        ) : (
          <div key={index} className="flex items-start gap-2">
            <div className="flex-1">{editor}</div>
            {controls}
          </div>
        );
      })}

      <button
        type="button"
        className={`${secondaryButtonClass} self-start`}
        onClick={() => onChange([...items, blank(itemTemplate)])}
      >
        + Add {singular}
      </button>
    </div>
  );
}
