# Mission Workstreams (A–E)

| ID | Workstream | Covers |
|----|-----------|--------|
| A | Requirements & Interface Definition | Orbit/link analysis (STK, GMAT), ICDs, success criteria |
| B | AI Model Design & Training | Lightweight models (decision trees, small NNs, RL) for data prioritization under link/power/urgency scenarios |
| C | Payload & Deployer Development | Firmware per radio mode (M17, Codec2, SSTV, TT&C), bench/integration tests, deployer release + separation signaling |
| D | AI Deployment & HIL Testing | Porting trained models to flight-computer-class hardware; HIL sim of commissioning + ground link |
| E | Ground Station + Integrated Testing | Multi-mode decode/visualization software; EMI/EMC, thermal-vac, vibration qual; end-to-end demo |

## Mapping a generic lab topic to a workstream
- Building/training a model or decision policy → **B**
- Writing embedded/firmware logic, protocol handling, bench tests → **C**
- Deploying a model to constrained hardware, simulating hardware-in-loop → **D**
- Building any ground-facing software (dashboards, decoders, visualizers, control UI) → **E**
- Defining interfaces, specs, link budgets, compliance criteria → **A**
- If a lab spans two, name primary + secondary — don't force a single fit.
