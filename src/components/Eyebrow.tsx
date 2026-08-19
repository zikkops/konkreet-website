/** The copper rule + small uppercase label that opens each section. */
export function Eyebrow({
  children,
  tone = "copper",
}: {
  children: React.ReactNode;
  tone?: "copper" | "cream";
}) {
  return (
    <div className="flex items-center gap-5 py-[15px]">
      <span className="rule" aria-hidden="true" />
      <h2
        className={`eyebrow font-bold ${
          tone === "cream" ? "text-cream" : "text-copper"
        }`}
      >
        {children}
      </h2>
    </div>
  );
}
