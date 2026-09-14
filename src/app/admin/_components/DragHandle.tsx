"use client";

/**
 * The grip that starts a drag. Drawn rather than typed, so it looks the same
 * on every machine, and styled as a button so it reads as something to grab.
 *
 * `onHold` flips while the pointer is down: only then does the row become
 * draggable, so clicking a link or a button inside it never starts a drag.
 */
export function DragHandle({
  onHold,
  className = "",
}: {
  onHold: (held: boolean) => void;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      title="Drag to reorder"
      onMouseDown={() => onHold(true)}
      onMouseUp={() => onHold(false)}
      className={`inline-flex shrink-0 cursor-grab items-center justify-center rounded-[2px] border border-ink/20 bg-cream px-1.5 py-1.5 text-ink/45 transition-colors hover:border-copper hover:bg-copper hover:text-white active:cursor-grabbing ${className}`}
    >
      <svg viewBox="0 0 10 16" className="h-4 w-[10px] fill-current">
        <circle cx="2" cy="3" r="1.4" />
        <circle cx="8" cy="3" r="1.4" />
        <circle cx="2" cy="8" r="1.4" />
        <circle cx="8" cy="8" r="1.4" />
        <circle cx="2" cy="13" r="1.4" />
        <circle cx="8" cy="13" r="1.4" />
      </svg>
    </span>
  );
}
