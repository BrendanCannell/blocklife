import * as U from "./util"
import T from "./memoized-canonical-tree"
import * as D from "./direction"

import CanonicalBranchConstructor from "./branch/canonical-constructor"
import NoncanonicalNewBranch from "./branch/new"
let NewBranch = CanonicalBranchConstructor(NoncanonicalNewBranch)

export const LEAF_SIZE = T.LEAF_SIZE

export function AddToBlur(infiniteGrid, blurData, viewport) {
  let {root, size} = infiniteGrid
    , {sizeCoefficient} = blurData.branchDerived
    , {v0: [viewportX0, viewportY0], v1: [viewportX1, viewportY1]} = viewport
    , paddedWidth  = U.ceilBy(LEAF_SIZE, viewportX1 - viewportX0) + LEAF_SIZE
    , paddedHeight = U.ceilBy(LEAF_SIZE, viewportY1 - viewportY0) + LEAF_SIZE
    , paddedX0 = U.floorBy(LEAF_SIZE, viewportX0)
    , paddedY0 = U.floorBy(LEAF_SIZE, viewportY0)
    , paddedX1 = paddedX0 + paddedWidth
    , paddedY1 = paddedY0 + paddedHeight
    , paddedViewport = {
        v0: [paddedX0, paddedY0],
        v1: [paddedX1, paddedY1]
      }
    , offsetPerRow = paddedWidth * sizeCoefficient / LEAF_SIZE
  return T.AddToBlur(size, root, -size/2, -size/2, paddedViewport, offsetPerRow, blurData)
}
export let BlurBuffer = T.BlurBuffer
export let DrawBlur = T.DrawBlur
export let ClearBlur = T.ClearBlur

export function Copy({size, root, empty}) {
  return {
    size,
    root: T.Copy(size, root),
    empty: T.Copy(size, empty)
  }
}

export function FromLiving(locations) {
  let max = locations.reduce((max, [x, y]) =>
        Math.max(max, Math.abs(x), Math.abs(y)), 1)
    , ceilPow2 = Math.pow(2, Math.ceil(Math.log2(max + 1)))
    , offset = Math.max(ceilPow2, T.LEAF_SIZE)
    , size = offset * 2
    , root = T.FromLiving(
        size,
        locations.map(([x, y]) => [x + offset, y + offset]),
      )
    , empty = T.FromLiving(size, [])
  return {size, root, empty}
}

export function* Living(infiniteGrid) {
  let offset = infiniteGrid.size / 2
  for (let [x, y] of T.Living(infiniteGrid.size, infiniteGrid.root))
    yield [x - offset, y - offset]
}

export function Next(infiniteGrid) {
  let {size, root: r, empty: e} = infiniteGrid
    , C = T.Next(size, r, e, e, e, e, e, e, e, e)
    , N = T.Next(size, e, e, r, e, e, e, e, e, e)
    , S = T.Next(size, e, r, e, e, e, e, e, e, e)
    , W = T.Next(size, e, e, e, e, r, e, e, e, e)
    , E = T.Next(size, e, e, e, r, e, e, e, e, e)
    , mustGrow = (
           N.population !== 0
        || S.population !== 0
        || W.population !== 0
        || E.population !== 0
      )
    , newRoot = mustGrow
      ? Grow(size, C, N, S, W, E)
      : {
        size,
        root: C,
        empty: T.Copy(size, e),
      }
  return newRoot
}

export function Get(grid, location) {
  let loc = GridLoc(grid.size, location)
  return loc && T.Get(grid.size, grid.root, loc)
}

export function Render(grid, renderCfg) {
  renderCfg.imageData.data.fill(renderCfg.colors.dead)
  T.Render(grid.size, grid.root, -grid.size/2, -grid.size/2, renderCfg)
}

export function Set(grid, pairs) {
  let {size, empty, root} = grid
    , withGridLocs = pairs.map(([loc, state]) => [GridLoc(size, loc), state])
    , mustGrow = withGridLocs.some(([loc]) => !loc)
  if (mustGrow) {
    let grown = Grow(size, root, empty, empty, empty, empty)
    return Set(grown, pairs)
  }
  else return {
    size, empty,
    root: T.Set(size, root, withGridLocs)
  }
}

function Grow(oldSize, center, north, south, west, east) {
  let emptyGrandchild = T.FromLiving(oldSize / 2, [])
    , e = emptyGrandchild
    , size = oldSize * 2
    , root = NewBranch(
        size,
        NewBranch(
          oldSize,
          e,
          north[D.SW],
          west[D.NE],
          center[D.NW]
        ),
        NewBranch(
          oldSize,
          north[D.SE],
          e,
          center[D.NE],
          east[D.NW]
        ),
        NewBranch(
          oldSize,
          west[D.SE],
          center[D.SW],
          e,
          south[D.NW]
        ),
        NewBranch(
          oldSize,
          center[D.SE],
          east[D.SW],
          south[D.NE],
          e
        )
      )
  return {
    size,
    root,
    empty: T.FromLiving(size, [])
  }
}

function GridLoc(size, [x, y]) {
  let d = size / 2
    , inRoot = -d <= x && x < d && -d <= y && y < d
  return inRoot ? [x + d, y + d] : null
}

function RootLoc (size, [x, y]) {
  let d = size / 2
  return [x - d, y - d]
}