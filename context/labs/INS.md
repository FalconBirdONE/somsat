# INS Lab → Mission Mapping (DRAFT)

## Workstream
Primary: **C** (secure command handling in payload firmware — TT&C uplink
authentication, preventing unauthorized commands)
Secondary: **E** (ground station link security, downlink integrity)

## Reframing generic INS topics
- Authentication/access control → TT&C uplink command authentication (who
  can command the satellite)
- Encryption → downlink data confidentiality for SSTV/voice payloads
- Network protocol security → M17/Codec2/SSTV as the "network," not generic
  client-server
- Threat modeling → unauthorized uplink, jamming, spoofed ground station,
  replay attacks on command frames
- Note: HAM band transmissions are typically unencrypted by regulation —
  flag this tension explicitly if a lab proposes encrypting downlink

## Discipline
EXTC/ECE or CSE / IT

## TODO
Confirm against actual INS syllabus — inferred, not confirmed.
