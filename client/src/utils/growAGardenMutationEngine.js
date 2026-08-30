// Grow a Garden Calculator — mutation conflict-resolution engine.
// Faithfully ported from the reference calculator's actual toggle and
// "Max Mutations" logic, not just its multiplier table:
//  - conflictGroups: a HARD LOCK, not an auto-switch. While one mutation
//    in a conflicting pair (e.g. Amber/Ancient Amber/Old Amber) is
//    active, the others are un-clickable (locked) until the active one
//    is deactivated first — matching the reference's real two-step
//    interaction, verified directly against its source.
//  - WET_GROUP (wet/chilled/drenched/frozen) is different: it genuinely
//    auto-switches (activating one immediately deactivates the other
//    three, no lock/two-step needed) — Frozen additionally LOCKS the
//    other three while it stays active.
//  - PASTA_TRIO -> Spaghetti: activating the 3rd of {pasta,sauce,meatball}
//    while the other two are active clears all three and activates Spaghetti.
//  - "Max Mutations" activates every eligible mutation in turn through
//    the same lock-aware resolution (so a later conflicting mutation is
//    silently skipped rather than ever coexisting with an earlier one —
//    a deliberate correctness choice over the reference's own two-pass
//    approach, which can let two conflicting mutations both end up
//    "active" if neither was locked yet when both passes ran), then
//    force-activates Frozen and force-locks Wet/Chilled.

/** Mutations locked (un-clickable) given the current active set — mirrors the reference's "disabled" class. */
export function computeLockedMutationIds(activeIds, { conflicts = {}, wetGroup = [] } = {}) {
  const locked = new Set();
  for (const id of activeIds) {
    for (const conflictId of conflicts[id] || []) locked.add(conflictId);
  }
  if (activeIds.has("frozen")) {
    for (const m of wetGroup) if (m !== "frozen") locked.add(m);
  }
  return locked;
}

/**
 * Toggle one mutation. No-ops if `id` is currently locked by a
 * conflictGroups hard-lock (matching the reference: a locked button
 * cannot be clicked at all — deactivate the blocker first). WET_GROUP
 * membership is the one exception: activating a member always
 * immediately clears the other three, never locks.
 */
export function toggleMutationWithConflicts(activeIds, id, { conflicts = {}, wetGroup = [], pastaTrio = [] } = {}) {
  if (computeLockedMutationIds(activeIds, { conflicts, wetGroup }).has(id)) return activeIds;

  const next = new Set(activeIds);
  if (next.has(id)) {
    next.delete(id);
    return next;
  }

  if (wetGroup.includes(id)) {
    for (const other of wetGroup) if (other !== id) next.delete(other);
  }
  next.add(id);

  if (pastaTrio.includes(id) && pastaTrio.every((m) => next.has(m))) {
    for (const m of pastaTrio) next.delete(m);
    next.add("spaghetti");
  }

  return next;
}

/**
 * "Max Mutations": activate every eligible mutation (not excluded, and
 * not admin-only if admin mutations are currently hidden) in turn
 * through the same conflict resolution used for manual toggling, then
 * force-activate Frozen and force-deactivate/lock Wet and Chilled —
 * matching the reference's own unconditional final step.
 */
export function computeMaxMutationSet(mutations, { excludedIds, adminIds, hideAdmin, conflicts = {}, wetGroup = [], pastaTrio = [] }) {
  let active = new Set();
  for (const m of mutations) {
    if (excludedIds.has(m.id)) continue;
    if (hideAdmin && adminIds.has(m.id)) continue;
    active = toggleMutationWithConflicts(active, m.id, { conflicts, wetGroup, pastaTrio });
  }
  active.add("frozen");
  active.delete("wet");
  active.delete("chilled");
  return active;
}
