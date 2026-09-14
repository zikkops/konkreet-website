"use client";

import { useEffect, useRef, useState } from "react";
import { inputClass, labelClass } from "./ui";

export type SearchItem = { id: number; title: string; role: string; group: string };

const MAX_RESULTS = 8;

const oneLine = (text: string) => text.replace(/\s+/g, " ").trim();

/** Find a project in a long list and jump to its row. */
export function ProjectSearch({ items }: { items: SearchItem[] }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const box = useRef<HTMLDivElement>(null);

  const term = oneLine(query).toLowerCase();
  const matches = term
    ? items
        .filter((item) =>
          [item.title, item.role, item.group].some((field) =>
            oneLine(field).toLowerCase().includes(term),
          ),
        )
        .slice(0, MAX_RESULTS)
    : [];
  const showList = open && term.length > 0;

  // Close the list when the pointer goes anywhere else.
  useEffect(() => {
    if (!showList) return;
    const close = (event: PointerEvent) => {
      if (!box.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [showList]);

  function jumpTo(item: SearchItem) {
    setQuery(oneLine(item.title));
    setOpen(false);

    const row = document.getElementById(`project-${item.id}`);
    if (!row) return;
    row.scrollIntoView({ behavior: "smooth", block: "center" });
    // Briefly outline it, so it's obvious which row was meant.
    row.classList.add("ring-2", "ring-copper");
    window.setTimeout(() => row.classList.remove("ring-2", "ring-copper"), 1600);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (matches.length === 0) return;

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((current) => (current + step + matches.length) % matches.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      jumpTo(matches[active] ?? matches[0]);
    }
  }

  return (
    <div ref={box} className="relative mb-6 w-full max-w-[480px]">
      <label htmlFor="admin-project-search" className={`${labelClass} mb-1.5 block`}>
        Find a project
      </label>

      <input
        id="admin-project-search"
        type="search"
        autoComplete="off"
        role="combobox"
        aria-expanded={showList && matches.length > 0}
        aria-controls="admin-project-search-results"
        aria-autocomplete="list"
        placeholder="Search by name, role or group"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        className={inputClass}
      />

      {showList && (
        <ul
          id="admin-project-search-results"
          role="listbox"
          aria-label="Matching projects"
          className="absolute z-30 mt-1 max-h-[300px] w-full overflow-y-auto border border-ink/15 bg-white shadow-lg"
        >
          {matches.length === 0 ? (
            <li className="px-4 py-3 text-[14px] text-ink/60">No project matches that.</li>
          ) : (
            matches.map((item, index) => (
              <li
                key={item.id}
                role="option"
                aria-selected={index === active}
                onMouseEnter={() => setActive(index)}
                onClick={() => jumpTo(item)}
                className={`cursor-pointer border-b border-ink/10 px-4 py-2.5 last:border-b-0 ${
                  index === active ? "bg-cream" : "bg-white"
                }`}
              >
                <span className="block font-bold text-primary">{oneLine(item.title)}</span>
                <span className="block text-[13px] text-ink/60">
                  {item.role ? `${item.role} · ` : ""}
                  {item.group}
                </span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
