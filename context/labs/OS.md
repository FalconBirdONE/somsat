# OS Lab → Mission Mapping (DRAFT)

## Workstream
Primary: **C** (Payload firmware — onboard scheduling per radio mode)
Secondary: **D** (porting scheduling logic to flight-computer-class hardware)

## Reframing generic OS topics
- CPU scheduling (FCFS/SJF/priority/round robin) → schedule TT&C / SSTV /
  M17-Codec2 transmissions instead of generic P1/P2/P3 jobs; priority order
  fixed per mission constraint unless the lab redesigns it
- Process synchronization / deadlock → shared RF Transceiver as the
  contended resource; model TT&C, SSTV, voice as competing processes
- Memory management → sub-1W/resource-constrained flight computer, not
  generic desktop assumptions
- File systems → onboard data priority queue persistence between passes

## Discipline
CE / CSE / IT (typical OS-lab home programs)

## TODO
Confirm against actual OS syllabus — inferred, not confirmed.
