/**
 * Workstream tile: glyph + 2–4 word label. No prose — density here comes from
 * visual rhythm, not sentences. Glyphs are inert (steel), never signal-yellow:
 * these tiles are not interactive.
 */
export default function WorkstreamCard({
  id,
  label,
  glyph,
}: {
  id: string;
  label: string;
  glyph: React.ReactNode;
}) {
  return (
    <article className="group flex flex-col items-center gap-3 rounded-lg border border-edge bg-obsidian-900 px-4 py-6 text-center transition-colors hover:border-edge-strong">
      <svg
        viewBox="0 0 48 48"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="h-10 w-10 text-steel/70 transition-colors group-hover:text-steel"
      >
        {glyph}
      </svg>

      <div>
        <span className="font-mono text-[11px] text-steel/45">{id}</span>
        <h3 className="display mt-0.5 text-sm leading-tight tracking-[0.06em] text-steel">
          {label}
        </h3>
      </div>
    </article>
  );
}
