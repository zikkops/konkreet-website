"use client";

import { useState } from "react";
import { CmsImage } from "@/components/CmsImage";
import { dangerButtonClass, labelClass, secondaryButtonClass } from "./ui";
import { uploadImage } from "./uploadImage";

/** The smallest photo that still looks sharp in a slot, and what shape the slot is. */
export type ImageSize = { width: number; height: number; note?: string };

const shapeOf = ({ width, height }: ImageSize) =>
  width > height * 1.1 ? "landscape" : height > width * 1.1 ? "portrait" : "roughly square";

/** The photo's own pixel size, or null when the browser can't decode it. */
async function pixelSize(file: File) {
  try {
    const bitmap = await createImageBitmap(file);
    const size = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return size;
  } catch {
    return null;
  }
}

export function ImageField({
  label,
  value,
  onChange,
  removable,
  size,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  removable?: boolean;
  size?: ImageSize;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");

  async function upload(file: File) {
    setUploading(true);
    setError("");
    setWarning("");
    try {
      const actual = size ? await pixelSize(file) : null;
      if (size && actual && (actual.width < size.width || actual.height < size.height)) {
        setWarning(
          `This photo is ${actual.width} × ${actual.height} px, smaller than the recommended ${size.width} × ${size.height} px, so it may look soft on large screens.`,
        );
      }
      onChange(await uploadImage(file));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className={labelClass}>{label}</span>
      {size && (
        <span className="text-[12px] text-ink/60">
          Recommended: at least {size.width} × {size.height} px, {shapeOf(size)}.
          {size.note && ` ${size.note}`}
        </span>
      )}
      <div className="flex flex-wrap items-center gap-4">
        {value ? (
          <CmsImage
            src={value}
            alt=""
            width={160}
            height={107}
            className="h-[107px] w-[160px] border border-ink/10 object-cover"
          />
        ) : (
          <div className="flex h-[107px] w-[160px] items-center justify-center border border-dashed border-ink/25 text-[12px] text-ink/50">
            No photo
          </div>
        )}
        <label className={`${secondaryButtonClass} cursor-pointer`}>
          {uploading ? "Uploading…" : value ? "Replace photo" : "Upload photo"}
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            disabled={uploading}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) void upload(file);
            }}
          />
        </label>
        {removable && value && !uploading && (
          <button type="button" className={dangerButtonClass} onClick={() => onChange("")}>
            Remove
          </button>
        )}
      </div>
      {warning && <p className="text-[13px] text-amber-700">{warning}</p>}
      {error && (
        <p role="alert" className="text-[13px] text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
