# UIP Lab → Mission Mapping (DRAFT)

## Workstream
Primary: **E** (ground station operator UI / mission control)
Secondary: **D** (HIL simulation front-end, if the lab covers interactive sim tooling)

## Reframing generic UIP topics
- Dashboard/UI design → mission control interface: battery state, pass
  countdown, priority queue visualization, link quality
- Human-in-the-loop controls → the ground-override control surface (must
  always be present per mission constraint — good UIP design problem: making
  override obvious/accessible, not buried)
- Data visualization → SSTV image preview, telemetry charts, pass timeline

## Experiments

### Exp 1 — Mission Status Dashboard (semantic color + status precedence)
- **Deliverable**: `app/dashboard/page.tsx`, `components/StatusTile.tsx`,
  `components/StatusLegend.tsx`, `lib/status.ts` (Next.js App Router + TS + Tailwind)
- **Problem**: all subsystems rendered identical green — operators couldn't
  tell "healthy" from "no incoming data" during a comms dropout.
- **Core rule**: `lastUpdatedSeconds > staleThresholdSeconds` → status is
  `stale`, overriding the reported value. Stale must never look like nominal.
- **Closed state set** (no ad hoc colors): `nominal` green/check/solid border,
  `degraded` amber/alert-triangle/solid, `fault` red/alert-octagon/solid+bold,
  `stale` gray/wifi-off/**dashed** border.
- **Accessibility**: color is never the sole encoder — every tile carries
  color + icon shape + text label. Must survive grayscale/colorblind sim.
  Text on colored backgrounds uses the darkest shade of the same hue.
  Light/dark via CSS vars + `dark:` classes, no hardcoded hex in components.
- **Mission tie-in**: stale tiles show "Router decisions may be based on
  outdated data" — serves the ground-override / explainable-AI constraint.
- **Tiles mocked**: Comm link, Battery health, Onboard temp, TT&C, SSTV queue,
  M17/Codec2 — with one deliberately stale and one degraded.
- **Tests**: `getEffectiveStatus` — fresh+nominal, stale-timestamp+nominal,
  fresh+fault.

## Discipline
IT / CSE / AI&DS (UX-adjacent programs)

## TODO
Confirm against actual UIP syllabus — inferred, not confirmed.
