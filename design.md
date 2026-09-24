# DESIGN.md — SpaceX Aerospace Minimalist System

**Master Design Specification for SomaiyaSat & SomaiyaPod Mission Control & Ground Station Portal**

*Target Environment: Next.js 16 App Router · React 19 · Tailwind CSS v4 · TypeScript*  
*Mission Identifier: SomaiyaSat (5cm PocketQube) & SomaiyaPod Deployer (KJS-SRS-01)*

---

## 1. Architectural Philosophy & Principles

The SomaiyaSat Mission Control Portal implements a **SpaceX-inspired Aerospace Minimalist System**, engineered for high-stress, data-dense orbital telemetry monitoring under extreme cognitive constraints.

### 1.1 Core Tenets

- **Monochrome & Stark:** High-contrast binary interface rooted in pure pitch black (`#000000`) and crisp white (`#FFFFFF`). Unnecessary chromatic decoration is eliminated so that vehicle graphics, orbital trajectories, and critical telemetry anomalies instantly command operator focus.
- **Industrial Telemetry Density:** Geometric sans-serif and monospaced instrumentation typography set predominantly in uppercase with positive letter-spacing (`tracking-wider` to `tracking-[0.34em]`). Emulates aerospace stencil placards, avionics HUD readouts, and space-qualified flight computer terminals.
- **Ghost Interface Components:** Traditional UI containers, drop-shadow elevations, heavy fills, and decorative cards are banished. Components float as "ghost" surfaces directly over full-bleed dark backdrops, bounded only by 1px hairline structural dividers (`rgba(255, 255, 255, 0.2)`).
- **Deterministic Non-Color Redundancy:** Telemetry readouts never rely on hue alone. Every subsystem status carries a tri-fold redundant encoding: **Semantic Accent Hue + Stencil Icon Geometry + SVG Ring Dash Pattern**, ensuring zero loss of critical information under monochrome displays, optical glare, or color-vision deficiency.
- **Autonomous Subsystem Epistemology & Ground Override:** Ground station operators retain absolute command authority (`GND armed`). Staleness is treated as an epistemological status (an unrefreshed subsystem is *unknown*, never assumed *healthy*), and every AI routing decision provides explicit safe-mode fallbacks.

---

## 2. Design Tokens & Palette Specifications

### 2.1 CSS Custom Properties (`:root`)

```css
:root {
  /* Canvas & Backgrounds */
  --bg-primary: #000000;
  --bg-secondary: #080808;
  --bg-surface-glass: rgba(0, 0, 0, 0.7);

  /* Typography & Foreground */
  --text-primary: #ffffff;
  --text-muted: #8e8e93;
  --text-subtle: #5a5a5f;

  /* Borders & Dividers */
  --border-hairline: rgba(255, 255, 255, 0.2);
  --border-active: #ffffff;

  /* Accents (Telemetry & Focus) */
  --accent-alert: #ff3b30;
  --accent-status-live: #00e676;

  /* Auxiliary Semantic Telemetry Tokens */
  --accent-degraded: #ff9f1c;
  --accent-stale: #8e8e93;
}
```

### 2.2 Tailwind CSS v4 `@theme inline` Mapping

```css
@theme inline {
  --color-bg-primary: var(--bg-primary);
  --color-bg-secondary: var(--bg-secondary);
  --color-bg-glass: var(--bg-surface-glass);

  --color-text-primary: var(--text-primary);
  --color-text-muted: var(--text-muted);
  --color-text-subtle: var(--text-subtle);

  --color-border-hairline: var(--border-hairline);
  --color-border-active: var(--border-active);

  --color-nominal: var(--accent-status-live);
  --color-fault: var(--accent-alert);
  --color-degraded: var(--accent-degraded);
  --color-stale: var(--accent-stale);
  --color-signal: var(--border-active);

  --font-display: var(--font-oswald);
  --font-sans: var(--font-inter);
  --font-mono: var(--font-plex-mono);
}
```

### 2.3 Semantic Surface & Ink Inventory

| Token | HEX / Alpha | Tailwind Class | Semantic Role & Architectural Intent |
|---|---|---|---|
| `--bg-primary` | `#000000` | `bg-bg-primary` / `bg-black` | Deep space canvas; full-bleed viewport floor. |
| `--bg-secondary` | `#080808` | `bg-bg-secondary` | Ghost panel backdrop, barely elevated (~1%) from black. |
| `--bg-surface-glass` | `rgba(0, 0, 0, 0.7)` | `bg-bg-glass backdrop-blur-md` | Floating HUD overlays and security modal backdrops. |
| `--border-hairline`| `rgba(255, 255, 255, 0.2)` | `border-border-hairline` | Ultra-thin 1px structural hairline; defines bounds without boxing. |
| `--border-active`  | `#ffffff` | `border-border-active` | Active selection rail, focus indicators, primary interactive stroke. |
| `--text-primary`   | `#ffffff` | `text-text-primary` / `text-white` | Primary instrumentation readouts, telemetry values, display H1/H2. |
| `--text-muted`     | `#8e8e93` | `text-text-muted` | Body copy, secondary indicators, inactive labels (4.5:1 compliant). |
| `--text-subtle`    | `#5a5a5f` | `text-text-subtle` | Stencil micro-labels, metadata keys, coordinate axes, tracking captions. |
| `--accent-status-live` | `#00e676` | `text-nominal` `stroke-nominal` | Live downlink locked, nominal health, fresh telemetry frame. |
| `--accent-alert`   | `#ff3b30` | `text-fault` `stroke-fault` | Confirmed hardware fault, power rail trip, threshold breach. |
| `--accent-degraded`| `#ff9f1c` | `text-degraded` `stroke-degraded` | Marginal link, battery derating, sub-optimal SNR. |
| `--accent-stale`   | `#8e8e93` | `text-stale` `stroke-stale` | Comms dropout, expired packet window, unknown health status. |

---

## 3. Layout Geometry & Grid Architecture (Preserved Layout)

The application adheres strictly to the existing two-route layout architecture:

### 3.1 Document Shell (`app/layout.tsx`)

| Element | Geometry & CSS Rule | Semantic Contract |
|---|---|---|
| `<html>` | `h-full antialiased` | Mounts display, sans, and mono font variables; sets `color-scheme: dark`. |
| `<body>` | `min-h-full flex flex-col bg-black text-white` | Pure black viewport canvas; flex-column structure. |
| `<main>` | `flex-1` | Route-driven fluid container. No persistent global chrome (no header/sidebar clutter). |

### 3.2 Landing Route (`/` — `app/page.jsx`)

The landing route acts as an interactive morphing aerospace portal that shifts seamlessly between **Guest Exploration Mode** and **Authenticated Flight Director HUD**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ HERO SECTION: max-w-6xl mx-auto px-5 sm:px-8 pt-6 sm:pt-8 pb-12             │
│                                                                             │
│ [COLLAPSIBLE INTRO HEADER: 5CM POCKETQUBE CAPSTONE MISSION / SOMAIYASAT]    │
│ (Collapses smoothly to 0px height upon Flight Director Authorization)        │
│                                                                             │
│ ┌───────────────────────────────────────┬─────────────────────────────────┐ │
│ │ 3D TILTED ORBIT VISUAL CANOPY         │ TACTICAL NAVIGATION HUD         │ │
│ │ • Elliptical PocketQube Path          │ • Level-4 Flight Director Auth  │ │
│ │ • Downlink Telemetry Ray to GS-01     │ • 01 // Mission Control Portal  │ │
│ │ • LEO 500KM SSO Telemetry Chips       │ • 02 // Weather & ATC [Standby] │ │
│ │ (Col-12 Guest → Col-5 Auth)           │ • 03 // Tactical Nav  [Standby] │ │
│ │                                       │ • Encrypted Disconnect Trigger  │ │
│ │                                       │ (Hidden Guest → Col-7 Auth)     │ │
│ └───────────────────────────────────────┴─────────────────────────────────┘ │
│                                                                             │
│ [CONTROL DOCK (Guest View)]: Version Selector [v2.0-live] + Operator Login   │
│ [LOGIN MODAL (Floating)]: Level-4 Callsign + Passcode + Encrypted TLS Badge │
├─────────────────────────────────────────────────────────────────────────────┤
│ MISSION WORKSTREAMS (A–E): max-w-6xl mx-auto px-5 sm:px-8 pb-16 pt-8        │
│ grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3                        │
│ [A: Interfaces] [B: AI Model] [C: Deployer] [D: HIL Testing] [E: Ground Stn]│
└─────────────────────────────────────────────────────────────────────────────┘
```

- **Container Bounds:** `max-w-6xl (72rem / 1152px), mx-auto`, `px-5 sm:px-8`.
- **Morphing Orbit Visual:** Spans full 12 columns in guest mode; smoothly transitions to `lg:col-span-5` with live telemetry headers when authenticated.
- **Flight Director HUD:** Expands to `lg:col-span-7` upon authentication with 3-item tactical routing list.
- **Workstreams Matrix:** 5-column grid (`lg:grid-cols-5`) presenting subsystems A through E with technical glyphs and stencil titles.

### 3.3 Mission Control Route (`/mission-control` — `app/mission-control/page.tsx`)

The flight deck is a full-width, reorderable telemetry widget grid over a legend/rationale rail. Subsystem detail opens in a stay-on-page overlay (§10.2) rather than a fixed side panel.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ HEADER: [← Back Arrow] + Eyebrow + H1 "MISSION CONTROL"   <dl> FAULTS/STALE/ │
│                                                             OVERRIDE         │
├─────────────────────────────────────────────────────────────────────────────┤
│ ROW 1: mt-6 · "TELEMETRY · 6 CHANNELS · DRAG THE GRIP TO REPRIORITISE"      │
│ grid gap-4 sm:grid-cols-2 lg:grid-cols-3  (TelemetryWidgetGrid)             │
│ ┌ P1          ⠿ ┐ ┌ P2          ⠿ ┐ ┌ P3          ⠿ ┐                         │
│ │ StatusTile row │ │ StatusTile row │ │ StatusTile row │   ⠿ = grip handle    │
│ │ ~~~ sparkline  │ │ ~~~ sparkline  │ │ ~~~ sparkline  │   (drag activator)   │
│ └────────────────┘ └────────────────┘ └────────────────┘                     │
│ ┌ P4 ... P6 ───────────────────────────────────────────┐                     │
│ Advisory banner when Stale > 0                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ ROW 2: mt-5 grid lg:grid-cols-[19rem_minmax(0,1fr)]                          │
│ ┌ STATE LEGEND (19rem) ┐ ┌ DESIGN RATIONALE (<details>) ───────────────────┐ │
└─────────────────────────────────────────────────────────────────────────────┘
        click widget body ──▶ DetailOverlay (Radix Dialog, centred, scrim)
```

- **Rank label:** `P{n}` in each widget header is the operator's display priority — it reflects grid order only. It does **not** reprioritise the onboard Data Priority Queue (TT&C > SSTV > M17/Codec2 is unchanged).
- **Live feed:** the page ticks once per second (mock random walk; see §8 WebSocket target). The tick never pauses — not during a drag, not while the overlay is open.
- **Vertical Hierarchy:** `pb-6` header divider → `mt-6` widget grid → `mt-5` legend rail → `gap-4` grid gutter / `gap-5` rail gutter.

---

## 4. Typography Hierarchy & Industrial Stencil Telemetry

### 4.1 Typeface Allocation

| Role | Font Family | Variable | Target Content |
|---|---|---|---|
| **Display / Placard** | **Oswald** (Condensed Sans) | `--font-oswald` | Page headings, modal titles, subsystem labels, workstream headers. |
| **Instrumentation** | **IBM Plex Mono** | `--font-plex-mono` | Numeric readouts, signal levels, dB/SNR metrics, timers, clocks, hex addresses. |
| **Prose / Fallbacks** | **Inter** (Neutral Geometric Sans)| `--font-inter` | Technical briefings, implication descriptions, operator instructions. |

### 4.2 Industrial Telemetry Scale & Stencil Spacing

```css
/* Display Utility: High-impact condensed styling */
.display {
  font-family: var(--font-oswald), "Arial Narrow", sans-serif;
  letter-spacing: -0.01em;
  text-transform: uppercase;
}
```

| Element | Font | Size | Weight | Tracking | Color |
|---|---|---|---|---|---|
| **Hero Mission Title** | Oswald | `text-4xl sm:text-6xl lg:text-7xl` | 700 | `tracking-[-0.01em]` | `#ffffff` |
| **Page H1 / Header** | Oswald | `text-3xl sm:text-4xl` | 700 | `tracking-tight` | `#ffffff` |
| **Subsystem Panel H2** | Oswald | `text-2xl` | 600 | `tracking-normal` | `#ffffff` |
| **Placard Eyebrows** | Plex Mono | `text-[10px] sm:text-[11px]` | 500 | `tracking-[0.34em]` | `#8e8e93` |
| **Channel Status Tag** | Plex Mono | `text-[10px]` | 600 | `tracking-[0.2em]` | Semantic State Hue |
| **Telemetry Tile Value**| Plex Mono | `text-[13px]` | 500 | `tracking-normal` | `#ffffff` |
| **Telemetry Detail Dial**| Plex Mono | `text-base` | 600 | `tracking-tight` | `#ffffff` / State Hue |
| **Header Metrics Counter**| Plex Mono | `text-sm` | 600 | `tracking-[0.16em]` | `#ffffff` (or Accent)|
| **Technical Body Prose**| Inter | `text-xs sm:text-sm` | 400 | `leading-6` | `#8e8e93` |

*Rule:* Every numeric counter in the header strip must use `padStart(2, "0")` (e.g., `01`, `00`) to guarantee zero layout shift during telemetry updates.

---

## 5. Orbital Motion & Satellite Animation System (Preserved)

The 3D Tilted Top-Down Orbit Visual (`components/OrbitVisual.jsx`) is preserved as the central graphical asset of the mission interface.

```
                  [ LAYER 1: BACK ORBIT ARC (rx=240, ry=85, dashed) ]
                                      ▲
                                      │
           ┌──────────────────────────┴──────────────────────────┐
           │        [ LAYER 2: PLANET EARTH (r=76) ]             │
           │  • Radial gradient surface: #1a1d26 → #050507       │
           │  • Atmospheric rim glow (r=82, alpha 0.45)          │
           │  • Latitude / Longitude spherical grid              │
           │  • Ground Station Target: GS-01 at (288, 168)       │
           │    with pulsing signal ring: pulse-signal-glow      │
           └──────────────────────────┬──────────────────────────┘
                                      │
                                      ▼
                 [ LAYER 3: FRONT ORBIT ARC (rx=240, ry=85) ]
                                      ▲
                                      │ (occlusion depth plane)
           ┌──────────────────────────┴──────────────────────────┐
           │   [ LAYER 4: ORBITING SATELLITE (28s period) ]      │
           │  • 5cm PocketQube Chassis with Solar Panels         │
           │  • Center Beacon LED & Monopole Antenna             │
           │  • Continuous Telemetry Downlink Ray to GS-01       │
           │    with beam-sweep keyframe animation               │
           └─────────────────────────────────────────────────────┘
```

### 5.1 Coordinate Space & Perspective Specs

- **SVG Viewport:** `viewBox="0 70 600 260"` with `-12°` system plane tilt (`transform="rotate(-12 300 200)"`).
- **Orbital Ellipse Parameters:** Semi-major axis $r_x = 240\text{px}$, semi-minor axis $r_y = 85\text{px}$.
- **Ground Station Node:** GS-01 locked at coordinate `(288, 168)` on Earth's northern hemisphere.

### 5.2 Keyframe Animation Specifications

```css
/* 28-second 3D Orbital Trajectory with Depth Occlusion & Dynamic Scaling */
@keyframes orbit-elliptical {
  0%   { transform: translate(540px, 200px) scale(0.85); opacity: 0.85; }
  12.5%{ transform: translate(470px, 260px) scale(1.05); opacity: 0.95; }
  25%  { transform: translate(300px, 285px) scale(1.18); opacity: 1.00; } /* Perigee / Front */
  37.5%{ transform: translate(130px, 260px) scale(1.05); opacity: 0.95; }
  50%  { transform: translate(60px,  200px) scale(0.85); opacity: 0.85; }
  62.5%{ transform: translate(130px, 140px) scale(0.68); opacity: 0.60; }
  75%  { transform: translate(300px, 115px) scale(0.60); opacity: 0.45; } /* Apogee / Back */
  87.5%{ transform: translate(470px, 140px) scale(0.68); opacity: 0.60; }
  100% { transform: translate(540px, 200px) scale(0.85); opacity: 0.85; }
}

/* Downlink Telemetry RF Carrier Pulse */
@keyframes beam-sweep {
  0%, 100% { opacity: 0.50; stroke-dashoffset: 0; }
  50%      { opacity: 0.85; stroke-dashoffset: -16; }
}

/* Ground Station Acquisition Radar Pulse */
@keyframes pulse-signal-glow {
  0%, 100% { r: 3px; opacity: 0.9; }
  50%      { r: 6px; opacity: 0.3; }
}

/* Critical Hardware Fault Breathing (Soft pulse rather than strobe) */
@keyframes fault-throb {
  0%, 100% { opacity: 1.0; }
  50%      { opacity: 0.7; }
}
```

### 5.3 Reduced Motion Accessibility Guarantee

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
}
```

---

## 6. UI Component Registry (Ghost Components)

### 6.1 StatusRing Primitive (`components/StatusTile.tsx`)

The system's core telemetry visualization primitive. Uses a shared coordinate space across all render sizes:

- **viewBox:** `0 0 104 104` with `-rotate-90` orientation (arc begins at 12 o'clock).
- **Outer State Ring ($R_{\text{state}} = 46\text{px}$):** Encodes subsystem health via stroke dash pattern and width.
- **Inner Gauge Arc ($R_{\text{gauge}} = 37\text{px}$):** Encodes scalar value ($0\text{–}100\%$) via circumference $C = 2\pi R \approx 232.48\text{px}$.
- **Rendered Dimensions:**
  - `h-7 w-7` ($28\text{px}$) — Legend reference row.
  - `h-9 w-9` ($36\text{px}$) — Telemetry widget row (grid card body).
  - `h-40 w-40` ($160\text{px}$) — Mission Control primary detail dial.

### 6.2 Redundant Status Style Matrix

| State | Accent Hue | Stroke Width | SVG Dasharray | Stencil Icon | Telemetry Implication |
|---|---|---|---|---|---|
| **Nominal** | `#00e676` (Live Green) | `2.0px` | `0` (Solid) | Circle-Check | Subsystem healthy; normal AI routing permitted. |
| **Degraded**| `#ff9f1c` (Amber) | `2.5px` | `1 6` (Dotted) | Alert-Triangle | Marginal performance; de-prioritize and derate power. |
| **Fault**   | `#ff3b30` (Alert Red) | `4.0px` | `0` (Solid Bold)| Octagon-Alert | Critical hardware failure; trigger payload shedding. |
| **Stale**   | `#8e8e93` (Ghost Gray)| `2.0px` | `9 7` (Dashed) | Wifi-Off | Packet timeout exceeded; gauge forced to 0; initiate ground override. |

### 6.3 Ghost Component Inventory

| Component | File Path | Architectural Role & Structural Rules |
|---|---|---|
| **RootLayout** | `app/layout.tsx` | Pure black root shell, font mounting, antialiased rendering. |
| **OrbitVisual**| `components/OrbitVisual.jsx` | 3D top-down orbit canopy with depth occlusion, Earth grid, PocketQube model, downlink ray. |
| **ArrowLink** | `components/ArrowLink.tsx` | Minimalist 40px circular navigation trigger with directional SVG arrow and drift hover. |
| **StatusTile** | `components/StatusTile.tsx` | Telemetry channel row; body of each grid widget and the click target that opens the overlay. |
| **TelemetryWidgetGrid** | `components/TelemetryWidgetGrid.tsx` | dnd-kit sortable grid of widgets; grip-handle drag, localStorage order. See §10.1. |
| **DetailOverlay** | `components/DetailOverlay.tsx` | Radix Dialog wrapping `StatusDetail` + badge, raw values, UTC timestamp, stale warning. See §10.2. |
| **StatusDetail**| `components/StatusDetail.tsx`| Telemetry inspection deck, rendered inside `DetailOverlay`; 160px dial, 4-field data grid, freshness meter, trend sparkline. |
| **Sparkline** | `components/StatusTile.tsx` | Dynamic SVG area-filled telemetry trend graph (`vectorEffect="non-scaling-stroke"`). |
| **StatusLegend**| `components/StatusLegend.tsx`| 4-row status reference table rendering active `StatusRing` instances. |
| **WorkstreamCard**| `components/WorkstreamCard.tsx`| 5-column ghost placard for Workstreams A–E with technical stencil line-art. |
| **Operator Login Modal**| `app/page.jsx` | Floating glass modal (`bg-black/80 backdrop-blur-md`) for Level-4 Flight Director authorization. |

---

## 7. Telemetry State Engine & Staleness Precedence

### 7.1 Telemetry Domain Model (`lib/status.ts`)

```typescript
export type SubsystemStatus = "nominal" | "degraded" | "fault" | "stale";

export interface TelemetryTile {
  id: string;
  label: string;
  status: SubsystemStatus;
  value: string;
  lastUpdatedSeconds: number;      // Seconds elapsed since last validated packet
  staleThresholdSeconds: number;   // Maximum allowed packet latency before stale override
  gauge?: number;                  // Optional 0–100 percentage for inner dial fill
  history?: number[];              // Array of recent numerical telemetry samples
}
```

### 7.2 The Staleness Precedence Axiom

$$\text{EffectiveStatus}(T) = \begin{cases} \text{stale}, & \text{if } T.\text{lastUpdatedSeconds} > T.\text{staleThresholdSeconds} \\ T.\text{status}, & \text{otherwise} \end{cases}$$

**Operational Rule:** A subsystem reporting "nominal" immediately prior to a radio horizon loss or telemetry drop is **epistemologically unknown**, not healthy. Staleness strictly supersedes reported status. When a channel becomes stale:
1. `getEffectiveStatus()` evaluates to `"stale"`.
2. The inner dial gauge is clamped to `0%`.
3. The numerical readout displays placeholder dashes (`——`).
4. The freshness progress bar pins to `100% (threshold exceeded)`.
5. The operator is prompted with Ground Station Override recommendations.

---

## 8. Unimplemented Specification Targets (NOT BUILT)

The following capabilities are specified in the mission architecture and must be integrated into the SpaceX Minimalist layout without altering the core token contract:

| Subsystem Module | Intended Grid Placement | Technical Specification & Constraints |
|---|---|---|
| **Mission Epoch Clock & Pass Countdown** | Header Right Strip | Monospaced countdown timer to next ground station AOS (Acquisition of Signal). Drives pass transmission window budget. |
| **Ground Station Command & Override Deck**| Fluid Column (Row 3) | Direct hardware telecommand uplink console with two-man rule confirmation for transmitter lockout override. |
| **Live Telemetry Event Stream (Log)** | Full-bleed bottom strip | Monospaced append-only chronological log of packet decodes, CRC check results, and autonomous scheduler decisions. |
| **Multi-Channel Time-Series Analyzer** | Fluid Column modal | Expanded multi-variate SVG chart comparing battery voltage, bus current, and solar array temperature. |
| **SSTV Image Frame Decoder** | Fluid Column modal | Progressive line-by-line rasterizer for Robot36 / Scottie1 amateur radio image decodes. |
| **Decoded Telemetry WebSocket Feed** | `app/mission-control/page.tsx` | Direct replacement of the mock `TILES` array with a live WebSocket hook (`/api/telemetry/stream`). |

---

## 9. AI Reverse Engineering & System Contract Analysis (KJS-SRS-01)

### 9.1 The Role of Reverse Engineering in Mission Telemetry Architecture

When building mission-critical aerospace cockpits, visual reference designs must be parsed into **deterministic rulesets**:
1. **Region Segmentation:** Deconstructing arbitrary screens into rigid CSS grid contracts (e.g., `lg:grid-cols-[19rem_minmax(0,1fr)]`) that prevent layout shifts during high-frequency telemetry streaming.
2. **Token Normalization:** Consolidating disparate gray values and arbitrary colors into a strict binary monochrome palette with distinct semantic accents (`#00e676`, `#ff3b30`).
3. **Redundancy Synthesis:** Supplementing flat reference mockups with multi-modal encodings (dash patterns, stencil iconography) to meet MIL-STD-1472 and aerospace accessibility standards.
4. **State Gap Remediation:** Identifying unrepresented mission failure modes (such as telemetry dropouts and stale packets) before writing UI code.

### 9.2 `DESIGN.md` as an Executable Build Contract

This `design.md` document serves as the absolute source of truth for human engineers and autonomous AI coding agents alike:
- **Zero Configuration Drift:** Declared tokens map 1:1 to Tailwind CSS v4 variables in `app/globals.css`.
- **Compile-Time Type Safety:** `STATUS_STYLES` is strictly typed against `Record<SubsystemStatus, ...>`, preventing runtime presentation bugs.
- **Predictable Agent Collaboration:** Coding assistants reference the explicit bounds and layout geometry herein to generate pixel-perfect extensions without breaking the minimalist SpaceX aesthetic.

---

## 10. Interaction Patterns (UIP Exp 05 — Workstream E)

Both patterns add behaviour only. No new colours: signal-yellow marks every drag/close affordance, and state is still carried by the four-state system (§6.2).

### 10.1 Drag-and-Drop Widget Reordering (`components/TelemetryWidgetGrid.tsx`)

Library: `@dnd-kit/core` + `@dnd-kit/sortable` (`rectSortingStrategy`, `rectIntersection` collision). Drag activates from the **grip handle only**, so a click or Enter on the widget body always means "open detail" and never starts a drag.

| State | Trigger | Visual |
|---|---|---|
| **Page load cue** | Initial render | Six-dot grip in `text-signal` at 25% opacity in every widget header — visible but quiet. |
| **Mouse hover** | Pointer over widget (`group-hover`) | Grip → 100% opacity, `cursor-grab`. Also 100% on keyboard focus and on `hover:none` (touch) devices, where hover never fires. |
| **Drag initiated** | 3px pointer/touch movement on grip (`distance: 3`), or Space/Enter on focused grip | `DragOverlay` copy lifts: `scale-[1.03]`, `shadow-2xl shadow-black`, `border-edge-strong`, `cursor-grabbing`. |
| **Enters valid target** | `over !== null` | Placeholder in the landing slot: content at 25% opacity, `outline-2 outline-dashed outline-signal` offset 2px. |
| **Drop accepted** | Released over a widget | `arrayMove`; remaining widgets reflow with dnd-kit's transform transition. Order saved. |
| **Drop rejected** | Released outside the grid (`over === null`) or Esc | No state change; `DragOverlay` drop animation springs the card back to its original slot. Outline removed as soon as the pointer leaves the grid. |

- **Sensors:** `MouseSensor` + `TouchSensor` (both 3px) + `KeyboardSensor` (`sortableKeyboardCoordinates`). Grip is `touch-none`, so a touch drag on it never scrolls the page, while touches on the rest of the widget still scroll.
- **Persistence:** `localStorage["somsat.mission-control.widget-order"]` — JSON array of channel ids, read via `useSyncExternalStore` (server snapshot `null` → no hydration mismatch). UI-layer only; no API.
- **Fallback:** `restoreOrder()` (`lib/order.ts`) drops unknown/duplicate ids and appends any channel missing from the save, so a stale or corrupt layout can reorder the grid but never hide a channel. Blocked storage → default order.
- **Scope:** per browser. The operator callsign is not persisted yet; key by callsign once login stores one.
- **Stale widgets** drag like any other.

### 10.2 Stay-on-Page Detail Overlay (`components/DetailOverlay.tsx`)

Library: `@radix-ui/react-dialog` (focus trap, `aria-modal`, focus return to the widget, scroll lock).

- **Open:** click/tap/Enter on a widget body. Controlled by `openId` in page state — **no route change**, dashboard stays mounted underneath.
- **Layout:** centred, `max-w-3xl`, `max-h-[calc(100dvh-2rem)]` scrolling; scrim `bg-obsidian-950/80` + 2px blur. Enters with the existing `float-up` keyframe (disabled under reduced motion).
- **Contents:** title bar (`{label} · live detail` + four-state badge: icon + name, dashed border when stale) → stale warning (if stale) → `StatusDetail` (dial, fields, freshness meter, sparkline, router implication, Cycle state) → raw value, last-packet UTC time, raw samples oldest → newest.
- **Dismiss:** scrim click, Escape, or the close control — 36px circle, `border-signal/50 text-signal`, top-right; fills signal-yellow on hover.
- **Live while open:** the overlay reads its tile from the live `tiles` array each render, and the 1s feed keeps ticking — values, freshness and even the state (e.g. a channel going stale mid-inspection) update in place.
- **Stale warning:** dashed `border-stale` panel with the wifi-off icon, `role="status"` (announced if a channel goes stale while open): *"Data may be unreliable. No packet for mm:ss, past the mm:ss window. The autonomous router may be scheduling from this value — consider ground override."* The raw value is still shown for forensics; the dial shows `——` per §7.2.
