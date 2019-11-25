import * as U from "./util"
import T from "./memoized-tree32"
import * as D from "./direction"

export const LEAF_SIZE = T.LEAF_SIZE

export function BoundingRect(grid) {
  if (T.GetPopulation(grid.root) === 0) return null
  let b = {
    top:     Infinity,
    bottom: -Infinity,
    left:    Infinity,
    right:  -Infinity
  }
  b = T.BoundingRect(grid.root, -grid.size/2, -grid.size/2, b)
  b.topleft = {
    x: b.left,
    y: b.top
  }
  b.bottomright = {
    x: b.right,
    y: b.bottom
  }
  b.width  = b.right  - b.left
  b.height = b.bottom - b.top
  b.center = {
    x: b.left + b.width/2,
    y: b.top  + b.height/2
  }
  return b
}

export function Copy({size, root, empty}) {
  return {
    size,
    root: T.Copy(root),
    empty: T.Copy(empty)
  }
}

export function FromLiving(locations) {
  // Find the smallest square centered at the origin that contains the locations
  var halfSize = 1
  for (let [x, y] of locations)
    halfSize = Math.max(halfSize, Math.abs(x), Math.abs(y))
  // Round up to the nearest power of two.
  halfSize = Math.pow(2, Math.ceil(Math.log2(halfSize + 1)))
  // The minimum grid size is twice the leaf size.
  halfSize = Math.max(halfSize, T.LEAF_SIZE)
  let offsetLocations = locations.map(([x, y]) => [x + halfSize, y + halfSize])
  let size = halfSize * 2
  return {
    size,
    root:  T.FromLiving(size, offsetLocations),
    empty: T.FromLiving(size, [])
  }
}

export function* Living(infiniteGrid) {
  let offset = infiniteGrid.size / 2
  for (let [x, y] of T.Living(infiniteGrid.root))
    yield [x - offset, y - offset]
}

export function Next(infiniteGrid) {
  let {size, root: r, empty: e} = infiniteGrid
    // Get the next generation of the root
    , C = T.Next(r, e, e, e, e, e, e, e, e)
    // Also get the next generation of empty regions to N/S/W/E
    , N = T.Next(e, e, r, e, e, e, e, e, e)
    , S = T.Next(e, r, e, e, e, e, e, e, e)
    , W = T.Next(e, e, e, e, r, e, e, e, e)
    , E = T.Next(e, e, e, r, e, e, e, e, e)
    // These will usually be empty
    // If they aren't, expand the grid
    , mustGrow = (
           N.population !== 0
        || S.population !== 0
        || W.population !== 0
        || E.population !== 0
      )
    , newRoot = mustGrow
      ? Grow(C, N, S, W, E)
      : {
        size,
        root: C,
        empty: T.Copy(e),
      }
  return newRoot
}

export function Get(grid, location) {
  let loc = GridLoc(grid.size, location)
  return loc && T.Get(grid.root, loc)
}

export function GetHash(grid) {
  return T.GetHash(grid.root)
}

export function GetPopulation(grid) {
  return T.GetPopulation(grid.root)
}

export function Render(grid, renderCfg) {
  renderCfg.imageData.data.fill(renderCfg.colors.dead)
  T.Render(grid.root, -grid.size/2, -grid.size/2, renderCfg)
}

export function Set(grid, pairs) {
  let {size, empty, root} = grid
    , withGridLocs = pairs.map(([loc, state]) => [GridLoc(size, loc), state])
    , mustGrow = withGridLocs.some(([loc]) => !loc)
  if (mustGrow) {
    let grown = Grow(root, empty, empty, empty, empty)
    return Set(grown, pairs)
  }
  else return {
    size,
    empty: T.Copy(empty),
    root: T.Set(root, withGridLocs)
  }
}

function Grow(center, north, south, west, east) {
  let oldSize = T.GetSize(center)
    , emptyGrandchild = T.FromLiving(oldSize / 2, [])
    , e = emptyGrandchild
    , size = oldSize * 2
    , root = T.NewBranch(
        size,
        T.NewBranch(
          oldSize,
          e,
          north[D.SW],
          west[D.NE],
          center[D.NW]
        ),
        T.NewBranch(
          oldSize,
          north[D.SE],
          e,
          center[D.NE],
          east[D.NW]
        ),
        T.NewBranch(
          oldSize,
          west[D.SE],
          center[D.SW],
          e,
          south[D.NW]
        ),
        T.NewBranch(
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

// [-size/2, size/2) -> [0, size)
function GridLoc(size, [x, y]) {
  let d = size / 2
    , inRoot = -d <= x && x < d && -d <= y && y < d
  return inRoot ? [x + d, y + d] : null
}

// [0, size) -> [-size/2, size/2]
function RootLoc (size, [x, y]) {
  let d = size / 2
  return [x - d, y - d]
}