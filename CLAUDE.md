# SomaiyaSat / SomaiyaPod — Capstone Context

## Mission (always loaded)
SomaiyaSat is a PocketQube-class (5cm-unit) satellite deployed by SomaiyaPod,
a purpose-built deployer. Post-deployment, an onboard AI scheduler/router
autonomously decides what data to transmit and when, across payload modes —
TT&C/housekeeping (highest priority), SSTV imagery (second), M17/Codec2
voice-data (last) — under tight power (~sub-1W avg) and short LEO ground-pass
windows. Architecture: Link Quality Estimator + Battery/Power Monitor +
Orbit/Pass Predictor + Data Priority Queue feed an AI-Based Autonomous
Manager, which controls TT&C, SSTV, and M17/Codec2, multiplexed through a
shared RF Transceiver to the ground station network.

## Non-negotiable constraints
- AI models must be lightweight/resource-constrained — flag anything assuming
  generous compute/power.
- Priority order: TT&C/housekeeping > SSTV > M17/Codec2, unless a lab is
  explicitly redesigning the priority scheme.
- Every autonomous routing/scheduling decision needs a stated fallback/safe
  mode. No "AI decides, no fallback."
- Ground operators retain command override. Full autonomy without
  human-override is out of scope.
- HAM licensing (ITU/national regs) and PocketQube registration compliance
  are real constraints — flag when a design choice needs regulatory sign-off.

## Tech stack
- Framework: Next.js (App Router assumed unless project files say otherwise)
- Applies to any lab producing a web UI/dashboard (WP2, UIP) — default to
  Next.js conventions (file-based routing, Server/Client Components, API
  routes or Route Handlers) instead of generic Express/vanilla setups.

## Session routing — do this first
1. If the active lab (OS / INS / WP2 / UIP) isn't stated in the user's
   message or inferable from files already open/discussed, ask them to pick
   one before doing substantive lab work.
2. If they name the lab in their first message, skip the question.
3. Once known, read `context/labs/<LAB>.md` before starting. Treat its
   workstream mapping as authoritative for the session.
4. Load `context/mission-brief.md` and `context/workstreams.md` only if you
   need more mission detail than the summary above provides.
5. If the user switches labs mid-session, re-run step 1 — don't assume the
   old lab's context still applies.
