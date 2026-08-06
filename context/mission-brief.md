# Mission Brief (on-demand detail)

## Problem statement
LEO PocketQubes have short ground-pass windows, sub-1W average power budgets,
and must serve three payload types (housekeeping telemetry, SSTV imagery,
M17/Codec2 voice-data) that compete for the same RF downlink. Manual,
ground-scheduled transmission wastes pass time and power. SomaiyaSat's
onboard AI scheduler decides autonomously what to send, when, using live
link/battery/orbit state — while keeping ground override and safe-mode
fallback intact.

## Architecture
- **Link Quality Estimator** — predicts usable downlink SNR/throughput per pass
- **Battery/Power Monitor** — tracks remaining energy budget
- **Orbit/Pass Predictor** — computes pass windows, elevation, duration
- **Data Priority Queue** — holds pending TT&C/SSTV/voice payloads, ranked
- **AI-Based Autonomous Manager** — consumes the above, decides transmit
  order/mode, drives TT&C, SSTV Transmission, M17/Codec2 Communication
- **RF Transceiver** — shared multiplexed radio to ground station network

## Objectives
- Demonstrate autonomous, priority-aware scheduling under realistic power/link
  constraints
- Keep the AI lightweight enough for flight-computer-class hardware
- Preserve ground-operator override at every autonomous decision point
- Validate end-to-end: deployment → commissioning → scheduled downlink →
  ground decode
