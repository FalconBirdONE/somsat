/**
 * Rebuild a saved widget order against the channels that exist now: saved ids
 * first (unknown/duplicate ones dropped), then any channel the save doesn't
 * mention. A bad or outdated save can reorder the grid, never hide a channel.
 */
export function restoreOrder(saved: unknown, ids: string[]): string[] {
  const kept = Array.isArray(saved)
    ? [...new Set(saved.filter((id): id is string => ids.includes(id)))]
    : [];
  return [...kept, ...ids.filter((id) => !kept.includes(id))];
}
