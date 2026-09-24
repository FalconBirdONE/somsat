"use client";

import * as Dialog from "@radix-ui/react-dialog";
import StatusDetail from "@/components/StatusDetail";
import { STATUS_STYLES } from "@/components/StatusTile";
import { formatAge, getEffectiveStatus, type TelemetryTile } from "@/lib/status";

/**
 * Stay-on-page inspection of one subsystem. `tile` is read from the live list
 * every render, so the overlay keeps updating while it's open.
 */
export default function DetailOverlay({
  tile,
  now,
  onClose,
  onCycle,
}: {
  tile: TelemetryTile | undefined;
  /** Wall clock of the last feed tick; null until the first one. */
  now: number | null;
  onClose: () => void;
  onCycle: () => void;
}) {
  return (
    <Dialog.Root open={tile !== undefined} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-obsidian-950/80 backdrop-blur-[2px]" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 flex-col gap-3 overflow-y-auto outline-none motion-safe:data-[state=open]:animate-[float-up_220ms_ease-out]"
        >
          {tile && <Body tile={tile} now={now} onCycle={onCycle} />}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Body({ tile, now, onCycle }: { tile: TelemetryTile; now: number | null; onCycle: () => void }) {
  const status = getEffectiveStatus(tile);
  const s = STATUS_STYLES[status];
  const lastPacket =
    now === null ? "——" : new Date(now - tile.lastUpdatedSeconds * 1000).toISOString().slice(11, 19);

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Dialog.Title className="font-mono text-[10px] uppercase tracking-[0.2em] text-steel/70">
            {tile.label} · live detail
          </Dialog.Title>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border border-current px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] ${s.text} ${status === "stale" ? "border-dashed" : ""} [&>svg]:h-3 [&>svg]:w-3`}
          >
            {s.icon}
            {s.name}
          </span>
        </div>
        <Dialog.Close
          aria-label="Close detail"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-signal/50 text-signal transition-colors hover:bg-signal hover:text-obsidian-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" className="h-4 w-4" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </Dialog.Close>
      </div>

      {status === "stale" && (
        <p
          role="status"
          className="flex items-start gap-3 rounded-xl border border-dashed border-stale/60 bg-stale/10 px-4 py-3 text-sm leading-6 text-stale"
        >
          <span className="mt-1 shrink-0">{s.icon}</span>
          <span>
            <strong className="font-semibold">Data may be unreliable.</strong> No packet for{" "}
            {formatAge(tile.lastUpdatedSeconds)}, past the {formatAge(tile.staleThresholdSeconds)} window.
            The autonomous router may be scheduling from this value — consider ground override.
          </span>
        </p>
      )}

      <StatusDetail tile={tile} onCycle={onCycle} />

      <dl className="grid gap-4 rounded-xl border border-edge bg-obsidian-900 p-5 font-mono text-[11px] sm:grid-cols-3">
        <div>
          <dt className="uppercase tracking-[0.16em] text-steel/45">Raw value</dt>
          <dd className="mt-1 text-[13px] text-steel">{tile.value}</dd>
        </div>
        <div>
          <dt className="uppercase tracking-[0.16em] text-steel/45">Last packet (UTC)</dt>
          <dd className="mt-1 text-[13px] text-steel">{lastPacket}</dd>
        </div>
        <div>
          <dt className="uppercase tracking-[0.16em] text-steel/45">Samples, oldest → newest</dt>
          <dd className="mt-1 break-words text-[13px] text-steel">
            {tile.history?.join(" · ") ?? "n/a"}
          </dd>
        </div>
      </dl>
    </>
  );
}
