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

function FromRoot(root) {
  let size = T.GetSize(root)
  let empty = T.FromLiving(size, [])
  return {size, root, empty}
}

export function* Living(grid) {
  let offset = grid.size / 2
  for (let [x, y] of T.Living(grid.root))
    yield [x - offset, y - offset]
}

export function Next(grid) {
  let {size, root, empty: e} = grid
  // A cell could be born outside the root if at least one edge has a population >= 3
  // So in that case we expand the grid and iterate the expanded version.
  for (let side of D.SIDES) {
    let edgePopulation = T.GetEdgePopulation(root, side)
    if (edgePopulation >= 3) return Next(Grow(grid))
  }
  return {
    size,
    root: T.Next(root, e, e, e, e, e, e, e, e),
    empty: T.Copy(e),
  }
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

function SetOrMutateMany(grid, pairs, inPlace) {
  let {size, empty, root} = grid
    , withGridLocs = pairs.map(([loc, state]) => [GridLoc(size, loc), state])
    , mustGrow = withGridLocs.some(([loc]) => !loc)
  if (mustGrow) {
    return SetOrMutateMany(Grow(grid), pairs, inPlace)
  }
  else {
    let method = inPlace ? 'MutateMany' : 'SetMany'
    return {
      size,
      empty: inPlace ? empty : T.Copy(empty),
      root: T[method](root, withGridLocs)
    }
  }
}

export let SetMany    = (grid, pairs) => SetOrMutateMany(grid, pairs, false)
export let MutateMany = (grid, pairs) => SetOrMutateMany(grid, pairs, true)

function Grow(grid) {
  return FromRoot(T.Grow(grid.root))
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