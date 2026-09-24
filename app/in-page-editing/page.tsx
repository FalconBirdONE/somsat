import ArrowLink from "@/components/ArrowLink";
import PriorityQueueTable from "@/components/PriorityQueueTable";
import SatelliteIdentityCard from "@/components/SatelliteIdentityCard";
import ThresholdConfig from "@/components/ThresholdConfig";

const SECTIONS = [
  { n: "01", title: "Multi-field inline edit", el: <SatelliteIdentityCard /> },
  { n: "02", title: "Table edit", el: <PriorityQueueTable /> },
  { n: "03", title: "Overlay edit", el: <ThresholdConfig /> },
];

/** Exp 04 review page — all three in-page editing patterns, stacked. */
export default function InPageEditingPage() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-8">
      <header className="flex items-center gap-4 border-b border-edge pb-6">
        <ArrowLink href="/mission-control" label="Back to Mission Control" direction="left" />
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-steel/50">
            UIP · Experiment 04
          </span>
          <h1 className="display mt-1 text-3xl leading-none text-white sm:text-4xl">
            In-Page Editing
          </h1>
        </div>
      </header>

      {SECTIONS.map((s) => (
        <section key={s.n} className="mt-8">
          <h2 className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-steel/50">
            {s.n} · {s.title}
          </h2>
          {s.el}
        </section>
      ))}
    </main>
  );
}
