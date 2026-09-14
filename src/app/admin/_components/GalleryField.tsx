"use client";

import { useState } from "react";
import { CmsImage } from "@/components/CmsImage";
import { DragHandle } from "./DragHandle";
import { labelClass, secondaryButtonClass } from "./ui";
import { uploadImage } from "./uploadImage";

const iconButton =
  "flex size-7 items-center justify-center bg-white/90 text-[13px] font-bold text-primary hover:bg-copper hover:text-white disabled:opacity-30";

export function GalleryField({ value, onChange }: { value: string[]; onChange: (value: string[]) => void }) {
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  async function add(files: File[]) {
    setError("");
    const added: string[] = [];
    for (const [index, file] of files.entries()) {
      setProgress(`Uploading ${index + 1} of ${files.length}…`);
      try {
        added.push(await uploadImage(file));
      } catch (uploadError) {
        setError(uploadError instanceof Error ? uploadError.message : `Upload of ${file.name} failed.`);
        break;
      }
    }
    setProgress(null);
    onChange([...value, ...added]);
  }

  const move = (from: number, to: number) => {
    if (to < 0 || to >= value.length || from === to) return;
    const next = [...value];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  };

  const canReorder = value.length > 1 && progress === null;

  return (
    <div className="flex flex-col gap-2">
      <span className={labelClass}>Gallery</span>
      <p className="text-[12px] text-ink/60">
        Grab a photo by its grip to drag it into place, or use the arrows. On the site the first half
        runs down the left column and the rest down the right.
      </p>

      {value.length > 0 && (
        <ul
          onDragOver={(event) => event.preventDefault()}
          className="grid grid-cols-2 gap-3 sm:grid-cols-4"
        >
          {value.map((src, index) => (
            <li
              key={src}
              draggable={canReorder}
              onDragStart={() => setDragIndex(index)}
              onDragEnter={() => {
                if (dragIndex === null || dragIndex === index) return;
                move(dragIndex, index);
                setDragIndex(index);
              }}
              onDragEnd={() => setDragIndex(null)}
              className={`group relative ${canReorder ? "cursor-grab active:cursor-grabbing" : ""} ${
                dragIndex === index ? "opacity-60 ring-2 ring-copper" : ""
              }`}
            >
              <CmsImage
                src={src}
                alt={`Gallery photo ${index + 1}`}
                width={200}
                height={140}
                draggable={false}
                className="h-[140px] w-full border border-ink/10 object-cover"
              />

              {canReorder && (
                <DragHandle
                  onHold={() => {}}
                  className="absolute left-1 top-1 opacity-80 group-hover:opacity-100"
                />
              )}
              <span className="absolute right-1 top-1 bg-white/90 px-1 text-[12px] font-bold text-ink/60">
                {index + 1}
              </span>

              <div className="absolute inset-x-1 bottom-1 flex justify-between">
                <span className="flex gap-1">
                  <button
                    type="button"
                    aria-label="Move earlier"
                    className={iconButton}
                    disabled={index === 0 || progress !== null}
                    onClick={() => move(index, index - 1)}
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    aria-label="Move later"
                    className={iconButton}
                    disabled={index === value.length - 1 || progress !== null}
                    onClick={() => move(index, index + 1)}
                  >
                    →
                  </button>
                </span>
                <button
                  type="button"
                  aria-label="Remove photo"
                  className={`${iconButton} text-red-700`}
                  disabled={progress !== null}
                  onClick={() => onChange(value.filter((_, i) => i !== index))}
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <label className={`${secondaryButtonClass} cursor-pointer self-start`}>
        {progress ?? "+ Add photos"}
        <input
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          disabled={progress !== null}
          onChange={(event) => {
            const files = Array.from(event.target.files ?? []);
            event.target.value = "";
            if (files.length > 0) void add(files);
          }}
        />
      </label>
      {error && (
        <p role="alert" className="text-[13px] text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
