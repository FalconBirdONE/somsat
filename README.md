# SomSat & SomPod

Mission Control portal and telemetry monitoring interface for the **SomSat** (5 cm PocketQube satellite) and **SomPod** deployer capstone mission.

## Features

- **Autonomous Downlink Routing**: Real-time telemetry monitoring for autonomous decisions across M17, Codec2, SSTV, and TT&C channels under tight power and pass-duration constraints.
- **Mission Control Telemetry Dashboard**: Subsystem state indicators (Nominal, Degraded, Fault, Stale) with real-time precedence rules, freshness tracking, and trend sparklines.
- **Single-Orchestrated Orbit Animation**: Centered orbital trajectory visualization of the PocketQube with downlink transmission sweeps.

## Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19
- **Styling**: Tailwind CSS v4
- **Typography**: Oswald, Inter, IBM Plex Mono (`next/font`)
- **Language**: TypeScript

## Getting Started

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run test` - Run telemetry and status logic unit tests
- `npm run lint` - Run ESLint
