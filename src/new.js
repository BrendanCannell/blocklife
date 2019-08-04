import * as D from "./direction"

export let Branch = function NewBranch(ctx, q0, q1, q2, q3) {
  let raw = ctx.Branch.Malloc()
  raw.size = q0.size * 2

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

  return raw
}

export let Neighborhood = function NewNeighborhood(
    ctx,
    node,
    N, S, W, E,
    NW, NE, SW, SE
  ) {
  let raw = ctx.Neighborhood.Malloc()
  raw.node = node

  raw.edges[D.N] = N.edges[D.N]
  raw.edges[D.S] = S.edges[D.S]
  raw.edges[D.W] = W.edges[D.E]
  raw.edges[D.E] = E.edges[D.W]

  raw.corners[D.NW] = NW.corners[D.SE]
  raw.corners[D.NE] = NE.corners[D.SW]
  raw.corners[D.SW] = SW.corners[D.NE]
  raw.corners[D.SE] = SE.corners[D.NW]

  return raw
}