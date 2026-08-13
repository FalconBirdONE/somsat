import { STATUS_STYLES, StatusRing } from "@/components/StatusTile";
import type { SubsystemStatus } from "@/lib/status";

const ORDER: SubsystemStatus[] = ["nominal", "degraded", "fault", "stale"];

/** Each row shows the real ring, so the dash pattern — the non-colour encoder
 *  — is legible in the legend exactly as it appears on the subsystems. */
export default function StatusLegend() {
  return (
    <dl className="flex flex-col gap-3.5">
      {ORDER.map((status) => {
        const s = STATUS_STYLES[status];
        return (
          <div key={status} className="flex items-center gap-3">
            <StatusRing status={status} className="h-7 w-7 shrink-0">
              <span className="[&>svg]:h-3 [&>svg]:w-3">{s.icon}</span>
            </StatusRing>
            <div className="min-w-0">
              <dt className={`font-mono text-[10px] uppercase tracking-[0.16em] ${s.text}`}>
                {s.name}
              </dt>
              <dd className="text-[11px] leading-tight text-steel/60">
                {s.meaning}
              </dd>
            </div>
          </div>
        );
      })}
    </dl>
  );
}
