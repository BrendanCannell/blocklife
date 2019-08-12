import * as D from "./direction"
import {Malloc} from "./context"

export let Branch = function NewBranch(...quadrants) {
  let raw = Malloc.Branch()()
  for (let i = 0; i < 4; i++)
    raw[i] = quadrants[i]
  return raw
}

const sourceQuadrants = [
  [D.NW, D.NE],
  [D.SW, D.SE],
  [D.NW, D.SW],
  [D.NE, D.SE]
]

export let Edge = function NewEdge(side, quadrants) {
  let raw = Malloc.Edge()()
    , sq = sourceQuadrants[side]
  for (let i = 0; i < 2; i++)
    raw[i] = quadrants[sq[i]].edges[side]
  return raw
}

export let Neighborhood = function NewNeighborhood(
    size,
    node,
    N,  S,  W,  E,
    NW, NE, SW, SE
  ) {
  let raw = Malloc.Neighborhood()()
  raw.node = node
  raw.size = size

  let adjacent = [N, S, W, E, NW, NE, SW, SE]
  for (let i = 0; i < 4; i++) {
    let oppositeEdge   = (i + 1) & 1
      , oppositeCorner = 3 - i
    raw.edges  [i] = adjacent[i]  .edges  [oppositeEdge]
    raw.corners[i] = adjacent[i+4].corners[oppositeCorner]
  }

  return raw
}