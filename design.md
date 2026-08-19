# design.md — SomaiyaSat & SomaiyaPod Mission Control Portal

Extracted from the code as it stands (Next.js 16 App Router + React 19 +
Tailwind CSS v4 + TypeScript). Every token, size and ratio below is what the
repository actually renders — not an aspiration. Sections marked **NOT BUILT**
are named in the experiment brief but have no implementation yet; they are
listed as specification targets so the next contributor does not invent
competing tokens.

Source of truth for the values here:
`app/globals.css`, `app/layout.tsx`, `app/page.tsx`,
`app/mission-control/page.tsx`, `components/*.tsx`, `lib/status.ts`.

---

## 1. Layout Geometry & Grid Architecture

### 1.1 Document shell

`app/layout.tsx`

| Element | Rule | Class |
|---|---|---|
| `<html>` | full height, antialiased, three font vars mounted | `h-full antialiased` |
| `<body>` | column flex, page background, min full height | `min-h-full flex flex-col bg-obsidian-950` |
| `<main>` | takes remaining height | `flex-1` |

There is no fixed app chrome — **no persistent header bar, no global sidebar**.
Each route owns its own header block. This is deliberate: two routes, one of
which is a full-bleed hero, so a global chrome would be dead weight.

### 1.2 Container

Both routes share one measure:

```
max-w-6xl (72rem / 1152px), mx-auto
px-5 → sm:px-8   (mission control)
px-6 → sm:px-10  (landing)
```

### 1.3 Landing route (`/`)

| Band | Geometry |
|---|---|
| Hero `<section>` | `relative flex min-h-[88vh] items-center overflow-hidden` |
| Hero inner | `max-w-6xl px-6 py-24 sm:px-10`, `relative` above the orbit layer |
| Orbit visual | `absolute inset-0`, `pointer-events-none`, `aria-hidden` |
| — bloom | `right-[-6%] top-[34%]`, `38rem × 38rem`, `-translate-y-1/2` |
| — SVG | `right-[-10%] top-[34%]`, `30rem` → `sm:38rem`, viewBox `0 0 400 400` |
| Headline measure | `max-w-[16ch]`, `leading-[0.92]` |
| Body copy measure | `max-w-md` |
| Workstream grid | `grid-cols-2 → sm:grid-cols-3 → lg:grid-cols-5`, `gap-3` |
| Section pad | `pb-28` |

### 1.4 Mission Control route (`/mission-control`)

The operative layout. Outer container `max-w-6xl px-5 py-10 sm:px-8`.

```
┌───────────────────────────────────────────────────────────────┐
│ HEADER  flex flex-wrap items-end justify-between               │
│         gap-x-8 gap-y-5 · border-b border-edge · pb-6          │
│  ┌ back arrow (40px) + eyebrow + H1 ┐   ┌ <dl> Faults/Stale/  │
│                                          Override, gap-7 ┐     │
├───────────────────────────────────────────────────────────────┤
│ ROW 1   mt-6 grid items-start gap-5                            │
│         lg:grid-cols-[19rem_minmax(0,1fr)]                     │
│  ┌ ASIDE 19rem ─────────┐ ┌ StatusDetail  fluid ─────────────┐│
│  │ selector listbox     │ │ h-full flex-col gap-7            ││
│  │ p-3, rows gap-0.5    │ │ p-6 → sm:p-8                     ││
│  └──────────────────────┘ └──────────────────────────────────┘│
├───────────────────────────────────────────────────────────────┤
│ ROW 2   mt-5, same grid template — columns stay aligned        │
│  ┌ State legend  p-5 ───┐ ┌ Design rationale <details>  p-5 ─┐│
└───────────────────────────────────────────────────────────────┘
```

**Grid contract:** both rows use the identical
`lg:grid-cols-[19rem_minmax(0,1fr)]` template, so the 19rem rail runs
unbroken down the page. `minmax(0,1fr)` (not `1fr`) is required — the
sparkline is a `w-full` SVG and would otherwise blow the column out.
Below `lg` both rows collapse to a single stacked column.

Vertical rhythm: `pb-6` under the header, `mt-6` to row 1, `mt-5` between
rows, `gap-5` between columns.

### 1.5 Detail panel internal flex

`components/StatusDetail.tsx` — `flex h-full flex-col gap-7`:

1. Title row — `flex flex-wrap items-start justify-between gap-4`
2. Dial + fields — `flex flex-wrap items-center gap-8`; ring is
   `h-40 w-40 shrink-0` (160px), fields are `grid flex-1 grid-cols-2
   gap-x-6 gap-y-4`
3. Freshness meter — `h-1.5` track, `rounded-full`
4. Trend sparkline — `h-12 w-full`, viewBox `280 × 48`,
   `preserveAspectRatio="none"`
5. Implication banner — `mt-auto` pins it to the panel floor so panel height
   is stable regardless of whether `history` exists

### 1.6 Ring geometry (one primitive, every size)

`components/StatusTile.tsx`

| Constant | Value | Meaning |
|---|---|---|
| viewBox | `0 0 104 104` | shared coordinate space |
| `R_STATE` | 46 | outer ring — **state** via dash pattern |
| `R_GAUGE` | 37 | inner arc — **value** 0–100 |
| `C_GAUGE` | `2πR` ≈ 232.5 | dasharray denominator for fill |
| rotation | `-rotate-90` | arc starts at 12 o'clock |

Rendered sizes: `h-7 w-7` (28px, legend) · `h-9 w-9` (36px, selector row) ·
`h-40 w-40` (160px, detail dial). Same geometry at all three, so a badge and
a dial read as the same object.

### 1.7 Breakpoints in use

`sm` (640px) — padding and type step-up. `lg` (1024px) — the two-column
mission-control split and the 5-across workstream grid. No `md`, `xl`, or
`2xl` rules exist; do not add one without a reason the container can't solve.

---

## 2. Color Palette & Dark-Mode Design System

**Dark only.** `color-scheme: dark` on `:root`, no light palette, no `dark:`
variants anywhere. Declared once in `app/globals.css` and exposed to Tailwind
through `@theme inline` — components never hardcode hex.

### 2.1 Surfaces

| Token | HEX | Tailwind | Use |
|---|---|---|---|
| `--obsidian-950` | `#0a0a0c` | `bg-obsidian-950` | page background |
| `--obsidian-900` | `#101116` | `bg-obsidian-900` | card / panel surface |
| `--obsidian-850` | `#16181e` | `bg-obsidian-850` | nested (meter track, ring well) |
| `--obsidian-800` | `#1e2027` | `stroke-obsidian-800` | inert strokes |

Panels sit ~2% off the page — the hierarchy is edge and spacing, not
elevation.

### 2.2 Edges

Borders are **alpha, not solid grey**, so they fade rather than draw a box.

| Token | Value | Tailwind |
|---|---|---|
| `--edge` | `rgba(184,190,201,0.09)` | `border-edge` |
| `--edge-strong` | `rgba(184,190,201,0.16)` | `border-edge-strong` (hover only) |

### 2.3 Semantic status states

Closed set. No ad-hoc status colour is permitted.

| State | Token | HEX | Tailwind | Meaning |
|---|---|---|---|---|
| Nominal | `--pulse-green` | `#39ff6a` | `text-nominal` `stroke-nominal` `bg-nominal/10` | confirmed healthy, fresh |
| Degraded | `--amber-degraded` | `#ff9f1c` | `text-degraded` … | marginal, approaching limit |
| Fault | `--alert-red` | `#ff3b3b` | `text-fault` … | confirmed failure |
| Stale | `--stale-gray` | `#8a929e` | `text-stale` … | no fresh telemetry — **unknown, not healthy** |

Tints for banner backgrounds are always `/10` of the same hue
(`bg-nominal/10` etc.), with the full-strength hue as the text colour.

### 2.4 Reserved hue

| Token | HEX | Rule |
|---|---|---|
| `--signal-yellow` | `#e8ff4d` | **interactive only** |

`signal` appears on: the arrow link ring and label, the "Cycle state" button,
the selected row's `border-l-2` and `bg-signal/[0.06]`, every
`focus-visible:outline-signal`, and the `<details>` marker. It appears on
nothing that isn't clickable — which is why `degraded` is amber and not
yellow. Amber is far enough in hue and chroma from `#e8ff4d` never to read as
a control.

### 2.5 Typographic ink

| Token | HEX | Use |
|---|---|---|
| `--steel-300` | `#b8bec9` | body text, labels, inert glyphs |
| — | `#ffffff` | headings only (`text-white`) |

Opacity ladder on steel — the entire de-emphasis system:
`text-steel` (100%) → `/80` prose → `/70` glyph → `/60` legend meaning →
`/55`, `/50`, `/45` micro-labels. `--stale-gray` was lightened off mid-grey
specifically to clear 4.5:1 on both `#0a0a0c` and `#101116`.

### 2.6 Non-colour redundancy (accessibility contract)

Colour is never the sole encoder. Each state carries **hue + icon shape +
ring dash pattern**:

| State | `dash` | `width` | Icon |
|---|---|---|---|
| nominal | `0` (solid) | 2 | circle-check |
| degraded | `1 6` (dotted) | 2.5 | alert-triangle |
| fault | `0` (solid, bold) | 4 | alert-octagon |
| stale | `9 7` (dashed) | 2 | wifi-off |

The readout survives greyscale and colour-vision deficiency. `StatusLegend`
renders the **real** `StatusRing`, not a colour swatch, so the dash pattern is
legible in the legend exactly as on the tiles.

### 2.7 Motion

| Keyframe | Applied to | Duration |
|---|---|---|
| `orbit-sweep` | hero satellite + beam group | 34s linear infinite |
| `fault-throb` | ring at `status === "fault"` | 2.4s ease-in-out infinite |
| `arrow-drift` | ArrowLink glyph, 2px x-drift | 3.6s ease-in-out infinite |

Fault *breathes* (1 → 0.7 opacity) rather than blinks — legible without being
an alarm strobe. All three are `motion-safe:` and a global
`prefers-reduced-motion` block collapses every animation/transition to 0.001ms.

---

## 3. Typography Hierarchy

Three faces, loaded via `next/font/google` in `app/layout.tsx` and bound to
Tailwind families in `@theme inline`.

| Role | Family | CSS var | Tailwind | Weights |
|---|---|---|---|---|
| Display | **Oswald** (condensed) | `--font-oswald` | `font-display` / `.display` | default |
| Body | **Inter** | `--font-inter` | `font-sans` (body default) | default |
| Instrumentation | **IBM Plex Mono** | `--font-plex-mono` | `font-mono` | 400 / 500 / 600 |

**Rule: every numeric telemetry readout renders in IBM Plex Mono.** Values,
ages, counters, gauges — anything an operator compares column-to-column.

### 3.1 `.display` utility

```css
.display {
  font-family: var(--font-oswald), "Arial Narrow", sans-serif;
  letter-spacing: -0.01em;
  text-transform: uppercase;
}
```

Note the sign: display sizes get **negative** tracking; mono micro-labels get
heavy **positive** tracking. Those are the two tracking regimes in the system.

### 3.2 Size / tracking scale as used

| Slot | Size | Family | Tracking | Colour |
|---|---|---|---|---|
| Hero H1 | `text-5xl → sm:text-7xl → lg:text-8xl`, `leading-[0.92]` | display | `-0.01em` | white / steel |
| Page H1 (mission) | `text-3xl → sm:text-4xl`, `leading-none` | display | `-0.01em` | white |
| Panel H2 | `text-2xl leading-none` | display | `-0.01em` | white |
| Section rule H2 | `text-xs` | display | `0.3em` | `steel/60` |
| Hero eyebrow | `text-[11px]` uppercase | mono | `0.32em` | `steel/55` |
| Route eyebrow | `text-[10px]` uppercase | mono | `0.2em` | `steel/50` |
| Panel label | `text-[10px]` uppercase | mono | `0.18em` | `steel/45` |
| Meter label | `text-[10px]` uppercase | mono | `0.16em` | `steel/50` |
| Tile name | `text-[12px]`, `leading-tight` | display | `0.07em` | steel |
| Tile value | `text-[13px]`, `leading-tight` | mono | — | steel |
| Tile state / age | `text-[10px]` | mono | — | state hue / `steel/45` |
| Dial value | `text-base leading-none` | mono | `tracking-tight` | state hue |
| Field value | `text-[13px]` | mono | — | steel |
| Header counters | `text-sm` | mono | `0.16em` | state hue or steel |
| Body prose | `text-base leading-7` / `text-sm leading-6` | sans | — | steel, `steel/80` |
| Legend meaning | `text-[11px] leading-tight` | sans | — | `steel/60` |

Counters are zero-padded (`padStart(2, "0")`) so the header does not reflow as
values change.

---

## 4. UI Components & Widget Registry

### 4.1 Built

| Component | File | Bounds | Behavioural states |
|---|---|---|---|
| **RootLayout** | `app/layout.tsx` | full viewport, column flex | static; mounts font vars |
| **ArrowLink** | `components/ArrowLink.tsx` | 40px circle (`h-10 w-10`) + optional mono label | idle drift · hover (fills signal, glyph goes obsidian, +0.5 x-shift) · `focus-visible` 2px signal outline · `direction="left"` mirrors via `rotate-180` |
| **OrbitVisual** | `components/OrbitVisual.tsx` | `absolute inset-0`, 30–38rem SVG | one 34s sweep; `pointer-events-none` + `aria-hidden`; monochrome steel only — no status hue, no signal |
| **WorkstreamCard** | `components/WorkstreamCard.tsx` | grid cell, `px-4 py-6`, 40px glyph | hover → `border-edge-strong` + glyph `steel/70 → steel`; **non-interactive**, never signal |
| **StatusRing** | `StatusTile.tsx` (named export) | 28 / 36 / 160px, viewBox 104 | outer dash = state, inner arc = gauge; `stale` forces fill to 0; `fault` throbs; 500ms dasharray transition |
| **Sparkline** | `StatusTile.tsx` (named export) | default 44×12; detail 280×48 | area fill at 0.12 opacity + `non-scaling-stroke` polyline; min/max auto-scaled, `span \|\| 1` guards flat series; `aria-hidden` |
| **StatusTile** | `components/StatusTile.tsx` (default) | full width of 19rem rail, `py-2.5 px-3`, `border-l-2` | renders `<button>` when `onSelect` given, else `<div>`; selected → signal left border + `bg-signal/[0.06]`; hover → `bg-white/[0.03]`; `aria-pressed`; `sr-only` meaning text; stale shows `——` and bare age instead of `T+` |
| **StatusDetail** | `components/StatusDetail.tsx` | fluid column, `h-full`, `p-6 → sm:p-8` | dial + fields + freshness meter + trend + implication banner; stale blanks value and gauge and pins the meter at 100% "threshold exceeded" |
| **StatusLegend** | `components/StatusLegend.tsx` | fits 19rem rail, rows `gap-3.5` | static; iterates the closed `ORDER` set through the real ring |
| **Telemetry selector rail** | `app/mission-control/page.tsx` | `19rem` column, `role="listbox"` | holds `selected` index; renders the stale-count advisory banner when `staleCount > 0` |
| **Header counter strip** | `app/mission-control/page.tsx` | header right, `<dl>` `gap-7` | Faults / Stale / Override; count goes hue-coloured only when non-zero; `Override: GND armed` is currently a static affordance |
| **Design rationale** | `app/mission-control/page.tsx` | fluid column, native `<details>` | collapsed by default; signal-coloured marker; zero JS |

### 4.2 State model

`lib/status.ts` — the whole domain model is four types-worth of code.

```ts
type SubsystemStatus = "nominal" | "degraded" | "fault" | "stale";

interface TelemetryTile {
  id, label, status, value,
  lastUpdatedSeconds,        // age of the reading
  staleThresholdSeconds,     // beyond this → stale, regardless of `status`
  gauge?,                    // 0–100 ring fill; omit for non-scalar subsystems
  history?,                  // recent samples, newest last → sparkline
}
```

**Status precedence rule — the core of the experiment:**

```ts
getEffectiveStatus(tile) =
  tile.lastUpdatedSeconds > tile.staleThresholdSeconds ? "stale" : tile.status
```

Staleness always wins. A subsystem that reported `nominal` before a comms
dropout is *unknown*, not healthy. No component reads `tile.status` directly
for presentation — every one of them calls `getEffectiveStatus` first.

Helpers: `cycleStatus(tile)` advances through the four states for demo, and
simulates `stale` by **ageing the timestamp past the threshold** rather than
special-casing it, so the demo path hits the same precedence rule the real
feed will. `formatAge(seconds)` → `"MM:SS"`.

React state lives entirely in `app/mission-control/page.tsx`
(`"use client"`): `useState` for `tiles` and `selected`. Derived values
(`effective`, `staleCount`, `faultCount`) are computed on render, never
stored. No context, no reducer, no store — two pieces of state and one route.

### 4.3 Styling conventions (binding)

- No hardcoded hex in components. Every colour comes from a `@theme` token.
- `STATUS_STYLES` class strings stay **literal** so Tailwind's scanner sees
  them. Never build a class by interpolation (`text-${status}` will not ship).
- `STATUS_STYLES` is `Record<SubsystemStatus, …>` — adding a state to the
  union fails the build until every field is supplied. That is the intended
  guard.
- Static-by-default: only the mission-control route is a Client Component.

### 4.4 NOT BUILT — named in the brief, no implementation

Specification targets. Slot them into the existing grid and token set; do not
introduce a parallel palette.

| Widget | Intended bounds | Notes |
|---|---|---|
| Mission Clock / pass countdown | header strip, 4th `<dl>` cell, mono `text-sm` | T-minus to next pass; drives the pass-window budget |
| Command Execution Panel | fluid column, third grid row | must carry the ground-override constraint visibly — override is a mission non-negotiable, not a buried menu |
| Alert / Status Log | full-bleed row below the grid, mono `text-[11px]`, hue per severity | append-only; reuses the four status hues, no new colours |
| Telemetry time-series charts | fluid column | `Sparkline` scales to it; axes and tooltips are the only additions needed |
| SSTV image preview | fluid column | payload-specific |
| Live feed | replaces the `TILES` mock | a `ponytail:` comment in `app/mission-control/page.tsx` marks the swap point — one `fetch()`, no refactor of the state model |

---

## 5. Post-Lab Question — KJS-SRS-01

> **AI Reverse Engineering for Mission Control Dashboard:** Your team is
> developing the SomaiyaSat & SomaiyaPod Mission Control Portal. You have
> identified a professionally designed satellite monitoring dashboard that
> contains telemetry panels, communication status indicators, and mission
> health widgets similar to your requirements. Explain how AI-driven reverse
> engineering and a `design.md` file can help your team understand the layout
> structure and accelerate the UI design process before development begins.

### 5.1 The problem being solved

A reference dashboard is a *rendered result*. What a team needs is the
*ruleset* that produced it: the grid template, the token set, the type scale,
and the behavioural contract of each widget. Reading those off a screenshot by
eye is slow, lossy, and — worst — every developer reads it slightly
differently. Three people building three panels from the same screenshot
produce three greys, three border radii, and three ideas of what yellow means.
That divergence is not caught by code review; it is caught six weeks later by
an operator who can no longer tell an alert from a button.

AI-driven reverse engineering attacks the extraction step; `design.md` attacks
the divergence step. They are two halves of one workflow.

### 5.2 How automated layout parsing decomposes a telemetry interface

Given the reference image (or its DOM), a vision-capable model performs a
structured decomposition rather than a description:

1. **Region segmentation.** Detect the top-level bands — header, rail, primary
   viewport, log strip — and recover the box model: which are fixed-width,
   which are fluid, where the gutters land. The output is a grid hypothesis,
   e.g. `grid-cols-[19rem_minmax(0,1fr)]` with `gap-5` — precisely the
   template this project runs, expressed as a rule rather than as pixels.
2. **Repeated-unit detection.** Find the element that recurs — the subsystem
   row, the KPI cell, the log line — and infer its internal template. In our
   case: `ring | label + state | value + age`. One repeated unit becomes one
   component; the parse tells you how many components you actually need, which
   is usually far fewer than a screenshot suggests.
3. **Token clustering.** Sample colours and cluster them. Distinct greys that
   cluster tightly are one surface token with opacity variants, not four
   colours. Ours resolve to four obsidian surfaces plus an opacity ladder on
   one steel ink — a fact worth knowing *before* someone hardcodes `#14161b`.
4. **Semantic role assignment.** This is the step a pixel-differ cannot do.
   The model reasons that a saturated yellow appearing on a button and on
   nothing else is an *interactive* token, not a warning one — which is
   exactly why this project routes `degraded` to amber `#ff9f1c` and reserves
   `#e8ff4d` for controls. Semantics, not swatches.
5. **Type-scale recovery.** Measure sizes, weights, and tracking; separate the
   condensed display face from the mono instrumentation face and note *which
   content type* each governs. Here that produces the binding rule: every
   numeric readout is IBM Plex Mono.
6. **State inference and gap analysis.** A static reference shows one state.
   The model enumerates the states each widget must have (default, hover,
   selected, focus-visible, empty, error, **stale**) and flags the ones the
   reference does not show. That gap list is the real value: the reference
   dashboard almost certainly has no *stale* state, and stale is this
   mission's central UX problem.

The result is not "a description of the picture" — it is a normalised
inventory: regions, tokens, scale, repeated units, missing states.

### 5.3 Why that inventory must land in `design.md` before code

`design.md` is where the extraction stops being a chat transcript and becomes
a build artefact:

- **Single source of truth for tokens.** The palette table in §2 is the
  contract. `app/globals.css` implements it once under `@theme inline`;
  components reference `bg-obsidian-900`, `text-fault`, `border-edge` and
  never a hex literal. Change the doc and the variable, and every surface
  follows. A hex typed into a component is a fork of the design system.
- **Grid alignment settled once.** §1.4 fixes
  `lg:grid-cols-[19rem_minmax(0,1fr)]` for *both* rows, and records *why*
  `minmax(0,1fr)` beats `1fr` (the `w-full` sparkline overflows otherwise).
  That is a bug pre-solved in prose for the cost of one line.
- **Widget behaviour before implementation.** §4.1 states each component's
  states — hover, selected, focus-visible, stale-blanked — so the person
  writing `StatusTile` is implementing a spec, not improvising one.
- **Reviewable and diffable.** Markdown in git means a palette change is a
  pull request with an argument attached, not a Figma comment nobody reads.
- **A brief an AI agent can execute.** The same document that aligns humans is
  the highest-value context you can hand a coding agent. "Build the command
  panel" plus §1–§4 yields something that matches the existing UI; the same
  prompt without them yields a fifth grey and a new blue.
- **Explicit gaps.** §4.4 lists what is *not* built. Reverse engineering
  reliably surfaces widgets the reference has and we lack — mission clock,
  command panel, alert log. Naming them with their intended bounds and their
  constraints (the command panel *must* expose ground override) turns the
  parse into a backlog.

### 5.4 How this maps onto our Next.js / React / Tailwind structure

The pipeline lands on real files, one stage per layer:

| Reverse-engineering output | Where it lands here |
|---|---|
| Colour clusters + semantic roles | `:root` custom properties → `@theme inline` in `app/globals.css` |
| Type scale + face-per-content-type | `next/font/google` in `app/layout.tsx`, plus the `.display` utility |
| Region segmentation | route-level `grid` / `flex` in `app/mission-control/page.tsx` |
| Repeated units | `components/StatusTile.tsx`, `WorkstreamCard.tsx` |
| Shared primitives across sizes | `StatusRing`, `Sparkline` — one geometry, three render sizes |
| Widget state tables | the `STATUS_STYLES` record in `StatusTile.tsx` |
| Data shape behind the widgets | `TelemetryTile` in `lib/status.ts` |
| Inferred missing state | `getEffectiveStatus` — the stale precedence rule |

Two structural consequences are worth calling out, because they are what makes
the document *enforceable* rather than aspirational:

**Tailwind v4 makes `design.md` executable.** Because tokens are declared as
CSS variables and re-exported through `@theme inline`, the utility names in
this document (`bg-obsidian-900`, `text-degraded`, `border-edge`) exist only
if the token exists. A component cannot silently drift from the palette — it
can only use a token or fail. One caveat the parse must respect: Tailwind
scans source text, so `STATUS_STYLES` holds **literal** class strings.
Interpolating `text-${status}` compiles and then ships unstyled.

**The type system enforces the state table.** `STATUS_STYLES` is typed
`Record<SubsystemStatus, {...}>`. Add `"safe-mode"` to the union and the build
breaks until name, meaning, implication, colour, dash, width and icon are all
supplied. The four states in §2.3 are a closed set in the compiler, not a
convention in a document — the strongest form of "single source of truth"
available.

**State management stays trivial on purpose.** §4.2 records that mission
control holds exactly two `useState` values and derives everything else on
render. Documenting that *before* development is what stops someone reaching
for Redux to hold a selected index. The parse tells you how much state the UI
actually needs; writing it down keeps the answer from inflating.

### 5.5 Mission-specific caveats

Reverse engineering copies *structure*, and structure only. Three things must
not be inherited from a reference dashboard:

- **Ground override is non-negotiable.** Whatever the reference does, the
  override control stays visible and reachable. A prettier layout is not a
  reason to bury it.
- **Absence of data is not health.** Most commercial dashboards have no stale
  state; ours must, because a green tile during a comms dropout is the exact
  failure this experiment exists to fix. Copy the grid, add the state.
- **Every autonomous decision needs a stated fallback.** The `implication`
  field on each status is not decoration — it is where "what the router does
  about it, and what the operator can do instead" is written down.

Legal note: reverse-engineer for *structure and system* — grid, scale, token
roles, state coverage. Reproducing a third party's proprietary visual identity
(their exact brand palette, logo, or bespoke iconography) is a licensing
question, not a design one.

### 5.6 Summary

Automated layout parsing converts a reference dashboard from a picture into an
inventory: regions, repeated units, token clusters with semantic roles, a type
scale, and — most valuably — the states the reference never shows. `design.md`
converts that inventory into a contract the whole team and any coding agent
builds against, before the first component is written. In this project that
contract is directly executable: tokens become `@theme` variables, the state
table becomes a `Record` the compiler checks, and the grid template becomes
one class string shared by every row. The reference gets us the structure in
hours instead of days; the mission constraints — stale-over-nominal
precedence, visible ground override, a stated fallback per decision — are ours
to add, and this document is where we add them.
