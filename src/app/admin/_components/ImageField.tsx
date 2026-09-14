"use client";

import { useState } from "react";
import { CmsImage } from "@/components/CmsImage";
import { dangerButtonClass, labelClass, secondaryButtonClass } from "./ui";
import { uploadImage } from "./uploadImage";

export function ImageField({
  label,
  value,
  onChange,
  removable,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  removable?: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function upload(file: File) {
    setUploading(true);
    setError("");
    try {
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
      {error && (
        <p role="alert" className="text-[13px] text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
