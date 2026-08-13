import ArrowLink from "@/components/ArrowLink";
import OrbitVisual from "@/components/OrbitVisual";
import WorkstreamCard from "@/components/WorkstreamCard";

const WORKSTREAMS = [
  {
    id: "A",
    label: "Requirements & Interfaces",
    glyph: (
      <>
        <path d="M12 6h18l6 6v30H12z" />
        <path d="M30 6v6h6" />
        <path d="M18 24h12M18 32h12" />
      </>
    ),
  },
  {
    id: "B",
    label: "AI Model Training",
    glyph: (
      <>
        <circle cx="24" cy="12" r="4" />
        <circle cx="13" cy="34" r="4" />
        <circle cx="35" cy="34" r="4" />
        <path d="M21 15 16 30M27 15l5 15M17 34h14" />
      </>
    ),
  },
  {
    id: "C",
    label: "Payload & Deployer",
    glyph: (
      <>
        <rect x="17" y="17" width="14" height="14" rx="2" />
        <path d="M17 24h-7M38 24h-7M24 17v-7M24 38v-7" />
        <path d="M8 20v8M40 20v8" />
      </>
    ),
  },
  {
    id: "D",
    label: "Deployment & HIL",
    glyph: (
      <>
        <rect x="10" y="14" width="28" height="20" rx="2" />
        <path d="M17 22h5l3 6 3-9 2 3h5" />
        <path d="M18 40h12" />
      </>
    ),
  },
  {
    id: "E",
    label: "Ground Station",
    glyph: (
      <>
        <path d="M14 38 26 16" />
        <path d="M10 36h12" />
        <path d="M20 12a13 13 0 0 1 12 12" />
        <path d="M26 6a20 20 0 0 1 16 18" />
        <circle cx="27" cy="15" r="2" />
      </>
    ),
  },
];

export default function Home() {
  return (
    <main className="flex-1 bg-obsidian-950">
      <section className="relative flex min-h-[88vh] items-center overflow-hidden">
        <OrbitVisual />

        <div className="relative mx-auto w-full max-w-6xl px-6 py-24 sm:px-10">
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-steel/55">
            KJS-SRS-01 · PocketQube capstone
          </p>

          {/* Arrow sits on the baseline of the last headline line — the eye
              lands there after reading, so the only route onward is where the
              reading already ends. */}
          <h1 className="display mt-6 max-w-[16ch] text-5xl leading-[0.92] text-white sm:text-7xl lg:text-8xl">
            Autonomous
            <br />
            downlink
            <br />
            <span className="text-steel">routing</span>
            {/* Inside the last line's inline box so it lands directly after
                "routing" — a sibling block would sit at the h1's full width. */}
            <span className="ml-5 inline-flex translate-y-[0.1em] align-middle sm:ml-7">
              <ArrowLink href="/mission-control" label="Mission Control" showLabel />
            </span>
          </h1>

          <p className="mt-8 max-w-md text-base leading-7 text-steel">
            A 5&nbsp;cm PocketQube that decides for itself what to transmit —
            telemetry, imagery or voice — inside a sub-1&nbsp;W budget and a
            four-minute pass.
          </p>

          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-2 font-mono text-[11px] uppercase tracking-[0.18em] text-steel/50">
            <span>M17</span>
            <span>Codec2</span>
            <span>SSTV</span>
            <span>TT&amp;C</span>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-28 sm:px-10">
        <h2 className="display border-b border-edge pb-3 text-xs tracking-[0.3em] text-steel/60">
          Workstreams
        </h2>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {WORKSTREAMS.map((w) => (
            <WorkstreamCard key={w.id} {...w} />
          ))}
        </div>
      </section>
    </main>
  );
}
