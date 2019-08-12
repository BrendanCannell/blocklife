import {default as G} from "./grid"
import {SIZE} from "./leaf"
import * as D from "./direction"
import * as U from "./util"
import {Branch as NewBranch} from "./canonicalize/new"

let ceilPow2 = n => Math.pow(2, Math.ceil(Math.log2(n)))
let floorSIZE = n => Math.floor(n * SIZE) / SIZE
let ceilSIZE = n => Math.ceil(n * SIZE) / SIZE

export function FromLiving(locations) {
  let max = locations.reduce((max, [x, y]) =>
        Math.max(max, Math.abs(x), Math.abs(y)), 1)
    , offset = Math.max(ceilPow2(max), SIZE)
    , size = offset * 2
    , grid = G.FromLiving(
        size,
        locations.map(([x, y]) => [x + offset, y + offset]),
      )
    , empty = G.FromLiving(size, [])

  return {size, grid, empty}
}

export function* Living(root) {
  let offset = root.size / 2

  for (let [x, y] of G.Living(root.size, root.grid))
    yield [x - offset, y - offset]
}

export function Next(root) {
  let {size, grid: g, empty: e} = root
    , R = G.Next(size, g, e, e, e, e, e, e, e, e)
    , N = G.Next(size, e, e, g, e, e, e, e, e, e)
    , S = G.Next(size, e, g, e, e, e, e, e, e, e)
    , W = G.Next(size, e, e, e, e, g, e, e, e, e)
    , E = G.Next(size, e, e, e, g, e, e, e, e, e)
    , mustGrow = (
           N.population !== 0
        || S.population !== 0
        || W.population !== 0
        || E.population !== 0
      )

  let newRoot = mustGrow
    ? Grow(size, R, N, S, W, E)
    : {
      size,
      grid: R,
      empty: G.FromLiving(size, []),
    }

  return newRoot
}

export function Get(root, location) {
  let r = root
    , loc = GridLoc(r.size, location)
  return loc && G.Get(r.size, r.grid, loc)
}

export function Set(root, pairs) {
  let {size, empty, grid} = root
    , withGridLocs = pairs.map(([loc, state]) => [GridLoc(size, loc), state])
    , mustGrow = withGridLocs.some(([loc]) => !loc)
  if (mustGrow) {
    let grown = Grow(size, grid, empty, empty, empty, empty)
    return Set(grown, pairs)
  }
  else return {
    size, empty,
    grid: G.Set(size, grid, withGridLocs)
  }
}

function Grow(oldSize, center, north, south, west, east) {
  let emptyGrandchild = G.FromLiving(oldSize / 2, [])
    , e = emptyGrandchild
    , size = oldSize * 2
    , grid = NewBranch(
        NewBranch(
          e,
          north[D.SW],
          west[D.NE],
          center[D.NW]
        ),
        NewBranch(
          north[D.SE],
          e,
          center[D.NE],
          east[D.NW]
        ),
        NewBranch(
          west[D.SE],
          center[D.SW],
          e,
          south[D.NW]
        ),
        NewBranch(
          center[D.SE],
          east[D.SW],
          south[D.NE],
          e
        )
      )
  return {
    size,
    grid,
    empty: G.FromLiving(size, [])
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