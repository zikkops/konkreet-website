"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { CmsImage } from "@/components/CmsImage";
import { deleteProject, reorderProjects } from "../actions";
import { ConfirmSubmit } from "./ConfirmSubmit";
import { dangerButtonClass, secondaryButtonClass } from "./ui";

export type ProjectRow = {
  id: number;
  title: string;
  role: string;
  coverImage: string | null;
  photos: number;
};

const oneLine = (title: string) => title.replace(/\s+/g, " ");

/**
 * The projects of one group, in the order they appear on the site. Drag a row
 * by its handle, or use the arrows — which also work by keyboard and on
 * touch screens, where dragging isn't available.
 */
export function ProjectList({ groupId, projects }: { groupId: string | null; projects: ProjectRow[] }) {
  const [rows, setRows] = useState(projects);
  const [source, setSource] = useState(projects);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  // A row only becomes draggable while the pointer is held on its handle.
  const [handleHeld, setHandleHeld] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  // Take the server's order again whenever the page re-renders with new data.
  if (source !== projects) {
    setSource(projects);
    setRows(projects);
  }

  const canReorder = groupId !== null && rows.length > 1;

  function move(from: number, to: number) {
    if (to < 0 || to >= rows.length || from === to) return rows;
    const next = [...rows];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setRows(next);
    return next;
  }

  function save(order: ProjectRow[]) {
    if (!groupId) return;
    const data = new FormData();
    data.set("groupId", groupId);
    data.set("order", order.map((row) => row.id).join(","));
    setSaved(false);
    startTransition(async () => {
      await reorderProjects(data);
      setSaved(true);
    });
  }

  if (rows.length === 0) {
    return (
      <p className="border border-dashed border-ink/20 bg-white p-4 text-[14px] text-ink/60">
        No projects yet.
      </p>
    );
  }

  return (
    <>
      {canReorder && (
        <p className="mb-2 flex items-center gap-2 text-[12px] text-ink/60">
          <span aria-hidden="true">⠿</span>
          Drag a project by its handle to reorder it, or use the arrows.
          {pending && <span className="font-bold text-copper">Saving new order…</span>}
          {!pending && saved && <span className="font-bold text-green-700">Order saved</span>}
        </p>
      )}

      <ul
        onDragOver={(event) => event.preventDefault()}
        className="divide-y divide-ink/10 border border-ink/10 bg-white"
      >
        {rows.map((row, index) => (
          <li
            key={row.id}
            draggable={handleHeld}
            onDragStart={(event) => {
              setDragIndex(index);
              event.dataTransfer.effectAllowed = "move";
            }}
            onDragEnter={() => {
              if (dragIndex === null || dragIndex === index) return;
              move(dragIndex, index);
              setDragIndex(index);
            }}
            onDragEnd={() => {
              setDragIndex(null);
              setHandleHeld(false);
              save(rows);
            }}
            className={`flex flex-wrap items-center gap-3 p-3 ${
              dragIndex === index ? "bg-cream ring-2 ring-copper" : ""
            }`}
          >
            <span
              aria-hidden="true"
              title="Drag to reorder"
              onMouseDown={() => setHandleHeld(true)}
              onMouseUp={() => setHandleHeld(false)}
              className={`select-none px-1 text-[20px] leading-none text-ink/40 ${
                canReorder ? "cursor-grab active:cursor-grabbing" : "invisible"
              }`}
            >
              ⠿
            </span>
            <span className="w-5 shrink-0 text-[13px] font-bold text-ink/40">{index + 1}</span>

            {row.coverImage ? (
              <CmsImage
                src={row.coverImage}
                alt=""
                width={72}
                height={54}
                draggable={false}
                className="h-[54px] w-[72px] object-cover"
              />
            ) : (
              <div className="h-[54px] w-[72px] bg-ink" />
            )}

            <div className="min-w-0 flex-1">
              <p className="whitespace-pre-line font-bold text-primary">{row.title}</p>
              <p className="text-[13px] text-ink/60">
                {row.role}
                {row.photos > 0 && ` · ${row.photos} photos`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1">
              {canReorder && (
                <>
                  <button
                    type="button"
                    aria-label={`Move ${oneLine(row.title)} up`}
                    disabled={index === 0}
                    onClick={() => save(move(index, index - 1))}
                    className={secondaryButtonClass}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    aria-label={`Move ${oneLine(row.title)} down`}
                    disabled={index === rows.length - 1}
                    onClick={() => save(move(index, index + 1))}
                    className={secondaryButtonClass}
                  >
                    ↓
                  </button>
                </>
              )}
              <Link href={`/admin/projects/${row.id}`} draggable={false} className={secondaryButtonClass}>
                Edit
              </Link>
              <form action={deleteProject}>
                <input type="hidden" name="id" value={row.id} />
                <ConfirmSubmit
                  className={dangerButtonClass}
                  message={`Delete “${oneLine(row.title)}” and its photos? This can't be undone.`}
                >
                  Delete
                </ConfirmSubmit>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
