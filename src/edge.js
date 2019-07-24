import * as H from "./hash"
import * as D from "./direction"

export const N = 0
export const S = 1
export const W = 2
export const E = 3

export let Malloc = () => [null, null]

export let SetDerived = (edge, hash = Hash(edge)) => {
  edge.hash = hash

  return edge
}

const sourceQuadrants = [
  [D.NW, D.NE],
  [D.SW, D.SE],
  [D.NW, D.SW],
  [D.NE, D.SE]
]

export let New = (raw, side, quadrants) => {
  let [q0, q1] = sourceQuadrants[side]

  raw[0] = quadrants[q0].edges[side]
  raw[1] = quadrants[q1].edges[side]

  return raw
}

export let Equal = (a, b) =>
  typeof a === 'number'
    ? a === b
    : Equal(a[0], b[0]) && Equal(a[1], b[1])

export let Hash = edge =>
  typeof edge[0] === 'number'
    ? H.ofArray(edge)
    : H.ofHashedArray(edge)