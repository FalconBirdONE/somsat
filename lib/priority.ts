export type QueueChannel = "ttc" | "sstv" | "m17";
export type Ranks = Record<QueueChannel, number>;

/** Mission default: TT&C > SSTV > M17/Codec2. Also the safe-mode fallback. */
export const DEFAULT_RANKS: Ranks = { ttc: 1, sstv: 2, m17: 3 };

/**
 * Move `ch` to `rank`, swapping with whichever channel held it, so ranks stay
 * a permutation of 1..n. While `locked`, TT&C can't move — neither directly
 * nor by another row stepping into its slot and swapping it down.
 */
export function setRank(
  ranks: Ranks,
  ch: QueueChannel,
  rank: number,
  locked: boolean,
): Ranks {
  const keys = Object.keys(ranks) as QueueChannel[];
  if (rank < 1 || rank > keys.length || ranks[ch] === rank) return ranks;
  if (locked && (ch === "ttc" || rank === ranks.ttc)) return ranks;
  const holder = keys.find((k) => ranks[k] === rank)!;
  return { ...ranks, [holder]: ranks[ch], [ch]: rank };
}
