import Link from "next/link";

/**
 * The site's single navigation motif: a signal-yellow arrow that sits inline
 * beside the page title. Forward (right) = into Mission Control, mirrored
 * (left) = back out. Yellow appears here and on nothing that isn't interactive.
 */
export default function ArrowLink({
  href,
  label,
  direction = "right",
  showLabel = false,
}: {
  href: string;
  label: string;
  direction?: "right" | "left";
  /** Render the label as visible mono text next to the arrow. */
  showLabel?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label={showLabel ? undefined : label}
      className="group inline-flex shrink-0 items-center gap-3 rounded-full outline-offset-4 focus-visible:outline-2 focus-visible:outline-signal"
    >
      {direction === "left" && <Arrow direction={direction} />}

      {showLabel && (
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-signal/80 transition-colors group-hover:text-signal">
          {label}
        </span>
      )}

      {direction === "right" && <Arrow direction={direction} />}
    </Link>
  );
}

function Arrow({ direction }: { direction: "right" | "left" }) {
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-signal/50 text-signal transition-colors duration-300 group-hover:border-signal group-hover:bg-signal group-hover:text-obsidian-950">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={`h-4 w-4 ${direction === "left" ? "rotate-180" : ""} motion-safe:animate-[arrow-drift_3.6s_ease-in-out_infinite] motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:translate-x-0.5`}
      >
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </svg>
    </span>
  );
}
