/**
 * Fixed shortcut back to the project index. Same shape as the hero's primary
 * call to action, but it hovers to teal rather than to transparent: the hero
 * sits on a dark photograph, whereas this floats over the cream page where
 * white-on-nothing would disappear.
 */
export function BackToProjects() {
  return (
    <a
      href="#projects"
      aria-label="Back to the project index"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-[2px] border border-copper bg-copper px-6 py-3 text-[12px] font-bold text-white shadow-lg shadow-ink/20 transition-colors duration-300 hover:border-primary hover:bg-primary"
    >
      <svg viewBox="0 0 24 24" className="size-3 fill-current" aria-hidden="true">
        <path d="M12 4 3 13h5v7h8v-7h5z" />
      </svg>
      BACK TO PROJECTS
    </a>
  );
}
