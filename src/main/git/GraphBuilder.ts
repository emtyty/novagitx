import type { GitRevision } from './types.js'

export function buildGraphLanes(revisions: GitRevision[]): void {
  const activeLanes: (string | null)[] = []

  for (const rev of revisions) {
    let myLane = activeLanes.indexOf(rev.objectId)

    if (myLane === -1) {
      const emptySlot = activeLanes.indexOf(null)
      myLane = emptySlot !== -1 ? emptySlot : activeLanes.length
      if (emptySlot !== -1) {
        activeLanes[emptySlot] = rev.objectId
      } else {
        activeLanes.push(rev.objectId)
      }
    }

    rev.branchLane = myLane
    rev.lanes = activeLanes
      .map((id, i) => (id !== null ? i : -1))
      .filter((i) => i !== -1)

    activeLanes[myLane] = null

    for (let i = 0; i < rev.parentIds.length; i++) {
      const parentId = rev.parentIds[i]
      if (activeLanes.includes(parentId)) continue

      if (i === 0) {
        activeLanes[myLane] = parentId
      } else {
        const slot = activeLanes.indexOf(null)
        if (slot !== -1) {
          activeLanes[slot] = parentId
        } else {
          activeLanes.push(parentId)
        }
      }
    }
  }
}
