import * as D from "./direction"
import * as U from "./util"

export let Branch = function NewBranch(ctx, q0, q1, q2, q3) {
  let s = q0.size
  if (s !== q1.size || s !== q2.size || s !== q3.size) {
    console.log({q0, q1, q2, q3})
    throw Error('Size mismatch')
  }

  let raw = ctx.Branch.Malloc()
  raw.size = s * 2
  raw[0] = q0
  raw[1] = q1
  raw[2] = q2
  raw[3] = q3

  return raw
}

const sourceQuadrants = [
  [D.NW, D.NE],
  [D.SW, D.SE],
  [D.NW, D.SW],
  [D.NE, D.SE]
]

export let Edge = function NewEdge(ctx, side, quadrants) {
  let raw = ctx.Edge.Malloc()
  let [q0, q1] = sourceQuadrants[side]

  raw[0] = quadrants[q0].edges[side]
  raw[1] = quadrants[q1].edges[side]
  raw.gen = ctx.gen

  return raw
}

export let Neighborhood = function NewNeighborhood(
    ctx,
    node,
    // N,  S,  W,  E,
    // NW, NE, SW, SE
  ) {
  let size = node.size
  for (let i = 1; i < arguments.length; i++)
    if (arguments[i].size !== size) {
      let [ctx, node, N,  S,  W,  E, NW, NE, SW, SE] = arguments
      console.log(U.map(grid => grid.size)({node, N,  S,  W,  E, NW, NE, SW, SE}))
      throw Error("Size mismatch")
    }
  let raw = ctx.Neighborhood.Malloc()
  raw.node = node

  for (let i = 0; i < 4; i++) {
    let oppositeEdge = (i + 1) % 2
    raw.edges[i] = arguments[i+2].edges[oppositeEdge]
    let oppositeCorner = 3 - i
    raw.corners[i] = arguments[i+6].corners[oppositeCorner]
  }

  return raw
}