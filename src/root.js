import {default as G} from "./grid"
import * as D from "./direction"
import * as U from "./util"
import {Branch as NewBranch} from "./canonicalize/new"

let ceilPow2 = n => Math.pow(2, Math.ceil(Math.log2(n)))
let floor32 = n => Math.floor(n * 32) / 32
let ceil32 = n => Math.ceil(n * 32) / 32

export function FromLiving(ctx, locations) {
  let max = locations.reduce((max, [x, y]) =>
        Math.max(max, Math.abs(x), Math.abs(y)), 0)
    , offset = Math.max(ceilPow2(max), 32)
    , grid = G.FromLiving(
        ctx,
        offset * 2,
        locations.map(([x, y]) => [x + offset, y + offset]),
      )
    , empty = G.FromLiving(ctx, offset * 2, [])

  return {grid, empty}
}

export function* Living(ctx, root) {
  let offset = root.grid.size / 2

  for (let [x, y] of G.Living(ctx, root.grid))
    yield [x - offset, y - offset]
}

let check = (branch, size = branch.size) => {
  for (let i = 0; i < 4; i++){
    if (branch[i].size !== size / 2) {
      console.log({i, branch})
      throw Error("Size mismatch")
    }
    if (branch[i].size > 32) check(branch[i], size/2)
  }

  return branch
}

export function Next(ctx, root) {
  check(root.grid)
  let g = root.grid
    , e = root.empty
    , center = G.Next(ctx, g, e, e, e, e, e, e, e, e)
    , N =      G.Next(ctx, e, e, g, e, e, e, e, e, e)
    , S =      G.Next(ctx, e, g, e, e, e, e, e, e, e)
    , W =      G.Next(ctx, e, e, e, e, g, e, e, e, e)
    , E =      G.Next(ctx, e, e, e, g, e, e, e, e, e)
    , mustGrow = (
           N.population !== 0
        || S.population !== 0
        || W.population !== 0
        || E.population !== 0
      )

  let newRoot = mustGrow
    ? Grow(ctx, center, N, S, W, E)
    : {
      grid: center,
      empty: G.FromLiving(ctx, center.size, [])
    }

  check(newRoot.grid)

  return newRoot
}

function Grow(ctx, center, north, south, west, east) {
  let e = G.FromLiving(ctx, center.size / 2, [])
    , grid = NewBranch(ctx,
        NewBranch(ctx,
          e,
          north[D.SW],
          west[D.NE],
          center[D.NW]
        ),
        NewBranch(ctx,
          north[D.SE],
          e,
          center[D.NE],
          east[D.NW]
        ),
        NewBranch(ctx,
          west[D.SE],
          center[D.SW],
          e,
          south[D.NW]
        ),
        NewBranch(ctx,
          center[D.SE],
          east[D.SW],
          south[D.NE],
          e
        )
      )
  return {
    grid,
    empty: G.FromLiving(ctx, center.size * 2, [])
  }
}

function LocationFromCorner(root, [x, y]) {
  let d = root.size / 2
    , inRoot = -d <= x && x < d && -d <= y && y < d

  return inRoot && [x + d, y + d]
}

function LocationFromOrigin (root, [x, y]) {
  let d = root.size / 2

  return [x - d, y - d]
}