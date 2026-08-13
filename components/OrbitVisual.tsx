/**
 * The hero's signature moment: one slow orbital sweep with the PocketQube
 * riding the ring, plus a downlink beam that reaches the ground station.
 * Deliberately monochrome-steel — status colours are not decorative, and
 * signal-yellow means "interactive", so neither appears here.
 * The whole effect is a single orchestrated rotation; nothing else animates.
 */
export default function OrbitVisual() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* Ambient bloom behind the orbit. */}
      {/* Anchored above centre so the fixed arrow button at the right edge
          never lands on the planet. */}
      <div className="absolute right-[-6%] top-[34%] h-[38rem] w-[38rem] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(184,190,201,0.12)_0%,transparent_62%)]" />

      <svg
        viewBox="0 0 400 400"
        className="absolute right-[-10%] top-[34%] h-[30rem] w-[30rem] -translate-y-1/2 opacity-80 sm:h-[38rem] sm:w-[38rem]"
      >
        {/* Planet limb. */}
        <circle cx="200" cy="200" r="70" className="fill-obsidian-900" />
        <circle
          cx="200"
          cy="200"
          r="70"
          className="fill-none stroke-steel/25"
          strokeWidth="1"
        />
        <path
          d="M139 165a70 70 0 0 0 122 0"
          className="fill-none stroke-steel/15"
          strokeWidth="1"
        />
        <path
          d="M132 235a70 70 0 0 0 136 0"
          className="fill-none stroke-steel/15"
          strokeWidth="1"
        />

        {/* Orbit tracks. */}
        <circle
          cx="200"
          cy="200"
          r="120"
          className="fill-none stroke-steel/20"
          strokeWidth="1"
        />
        <circle
          cx="200"
          cy="200"
          r="160"
          className="fill-none stroke-steel/12"
          strokeWidth="1"
          strokeDasharray="2 8"
        />

        {/* Ground station marker on the limb. */}
        <circle cx="200" cy="130" r="2.5" className="fill-steel/70" />

        {/* The one moving part: satellite + its downlink beam, on one sweep. */}
        <g
          style={{
            transformOrigin: "200px 200px",
            animation: "orbit-sweep 34s linear infinite",
          }}
        >
          <path
            d="M320 200 200 130"
            className="stroke-steel/25"
            strokeWidth="1"
            strokeDasharray="3 5"
          />
          <rect
            x="313"
            y="193"
            width="14"
            height="14"
            rx="2"
            className="fill-obsidian-900 stroke-steel/80"
            strokeWidth="1.5"
          />
          <path
            d="M307 200h-8M341 200h-8"
            className="stroke-steel/60"
            strokeWidth="3"
          />
        </g>
      </svg>
    </div>
  );
}
