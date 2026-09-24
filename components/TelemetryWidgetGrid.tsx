"use client";

import { useId, useState, useSyncExternalStore } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  rectIntersection,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import StatusTile, { STATUS_STYLES, Sparkline } from "@/components/StatusTile";
import { restoreOrder } from "@/lib/order";
import { getEffectiveStatus, type TelemetryTile } from "@/lib/status";

// ponytail: one key per browser — the operator callsign isn't persisted
// anywhere yet. Suffix it with the callsign once login stores one.
const STORAGE_KEY = "somsat.mission-control.widget-order";

// Server snapshot is null, so SSR and hydration both render the default order.
const subscribe = (cb: () => void) => {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
};
const readStored = () => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null; // storage blocked: default order
  }
};
const parse = (raw: string | null): unknown => {
  try {
    return JSON.parse(raw ?? "null");
  } catch {
    return null; // corrupt value: default order
  }
};

const GripIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
    {[5, 12, 19].flatMap((y) => [9, 15].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.6" />))}
  </svg>
);

function WidgetCard({
  tile,
  rank,
  onOpen,
  handle,
  className = "",
  style,
  ref,
}: {
  tile: TelemetryTile;
  rank: number;
  onOpen?: () => void;
  handle: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLDivElement>;
}) {
  const status = getEffectiveStatus(tile);
  return (
    <div
      ref={ref}
      style={style}
      className={`group rounded-xl border border-edge bg-obsidian-900 p-2 ${className}`}
    >
      <div className="flex items-center justify-between px-3 pt-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-steel/45">
          P{rank}
        </span>
        {handle}
      </div>
      <StatusTile tile={tile} onSelect={onOpen} />
      {tile.history && (
        <Sparkline
          data={tile.history}
          w={200}
          h={24}
          className={`mx-3 mb-2 h-6 w-[calc(100%-1.5rem)] ${status === "stale" ? "text-stale/50" : STATUS_STYLES[status].text}`}
        />
      )}
    </div>
  );
}

const gripClass =
  "flex h-7 w-7 touch-none items-center justify-center rounded-md text-signal transition-opacity focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-signal";

function SortableWidget({
  tile,
  rank,
  onOpen,
  targetValid,
}: {
  tile: TelemetryTile;
  rank: number;
  onOpen: () => void;
  targetValid: boolean;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: tile.id });

  return (
    <WidgetCard
      ref={setNodeRef}
      tile={tile}
      rank={rank}
      onOpen={onOpen}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      // The source card stays in the grid as the landing-slot placeholder.
      className={
        isDragging
          ? `[&>*]:opacity-25 ${targetValid ? "outline-2 outline-offset-2 outline-dashed outline-signal" : ""}`
          : ""
      }
      handle={
        <button
          ref={setActivatorNodeRef}
          type="button"
          aria-label={`Reorder ${tile.label}`}
          className={`${gripClass} cursor-grab opacity-25 group-hover:opacity-100 [@media(hover:none)]:opacity-100`}
          {...attributes}
          {...listeners}
        >
          {GripIcon}
        </button>
      }
    />
  );
}

/** Mission Control widget grid: drag to reprioritise, click to inspect. */
export default function TelemetryWidgetGrid({
  tiles,
  onOpen,
}: {
  tiles: TelemetryTile[];
  onOpen: (id: string) => void;
}) {
  const stored = useSyncExternalStore(subscribe, readStored, () => null);
  const [local, setLocal] = useState<string[] | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overValid, setOverValid] = useState(false);
  const dndId = useId();

  const order = restoreOrder(local ?? parse(stored), tiles.map((t) => t.id));
  const byId = new Map(tiles.map((t) => [t.id, t]));
  const active = activeId ? byId.get(activeId) : undefined;

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 3 } }),
    useSensor(TouchSensor, { activationConstraint: { distance: 3 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const reset = () => {
    setActiveId(null);
    setOverValid(false);
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    reset();
    // No target (dropped outside the grid): nothing changes and DragOverlay
    // animates the card back to its slot.
    if (!over || active.id === over.id) return;
    const next = arrayMove(order, order.indexOf(String(active.id)), order.indexOf(String(over.id)));
    setLocal(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Layout still applies for this session.
    }
  };

  return (
    <DndContext
      id={dndId}
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={({ active }) => setActiveId(String(active.id))}
      onDragOver={({ over }) => setOverValid(over !== null)}
      onDragEnd={onDragEnd}
      onDragCancel={reset}
    >
      <SortableContext items={order} strategy={rectSortingStrategy}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {order.map((id, i) => (
            <SortableWidget
              key={id}
              tile={byId.get(id)!}
              rank={i + 1}
              onOpen={() => onOpen(id)}
              targetValid={overValid}
            />
          ))}
        </div>
      </SortableContext>

      <DragOverlay>
        {active && (
          <WidgetCard
            tile={active}
            rank={order.indexOf(active.id) + 1}
            className="scale-[1.03] cursor-grabbing border-edge-strong shadow-2xl shadow-black"
            handle={<span className={`${gripClass} opacity-100`}>{GripIcon}</span>}
          />
        )}
      </DragOverlay>
    </DndContext>
  );
}
