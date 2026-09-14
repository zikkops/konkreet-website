import type { FormResult } from "./types";

export const labelClass = "text-[12px] font-bold uppercase tracking-[0.1em] text-primary";
export const inputClass =
  "w-full border border-ink/20 bg-white px-3 py-2 text-[15px] text-ink focus:border-copper focus:outline-none";
export const buttonClass =
  "inline-block rounded-[2px] bg-copper px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-primary disabled:opacity-60";
export const secondaryButtonClass =
  "inline-block rounded-[2px] border border-ink/20 bg-white px-3 py-1.5 text-[13px] font-bold text-primary transition-colors hover:border-copper disabled:opacity-40";
export const dangerButtonClass =
  "inline-block rounded-[2px] border border-red-700/30 bg-white px-3 py-1.5 text-[13px] font-bold text-red-700 transition-colors hover:bg-red-50";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className={labelClass}>{label}</span>
      {children}
      {hint && <span className="text-[12px] text-ink/60">{hint}</span>}
    </label>
  );
}

export function PageTitle({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[32px] font-bold text-primary">{title}</h1>
        {description && <p className="mt-1 max-w-[640px] text-[15px] text-ink/70">{description}</p>}
      </div>
      {action}
    </div>
  );
}

/** Sticky save button with the action's result beside it. */
export function SaveBar({ pending, result, label }: { pending: boolean; result: FormResult; label: string }) {
  return (
    <div className="sticky bottom-0 z-30 flex flex-wrap items-center gap-4 border-t border-ink/10 bg-white/95 px-4 py-3 backdrop-blur">
      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "Saving…" : label}
      </button>
      {result && (
        <p role="status" className={`text-[14px] ${result.ok ? "text-green-700" : "text-red-700"}`}>
          {result.message}
        </p>
      )}
    </div>
  );
}
