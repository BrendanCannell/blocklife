import * as H from "./hash"
import * as D from "./direction"

export let Malloc = () => ({
  node: null,
  edges: [null, null, null, null],
  corners: [0, 0, 0, 0],
  next: null
})

export let New = (
      raw = Malloc(),
      node,
      N, S, W, E,
      NW, NE, SW, SE
    ) => {
  raw.node = node
  
  raw.edges[D.N] = N
  raw.edges[D.S] = S
  raw.edges[D.W] = W
  raw.edges[D.E] = E

  raw.corners[D.NW] = NW
  raw.corners[D.NE] = NE
  raw.corners[D.SW] = SW
  raw.corners[D.SE] = SE

  return raw
}

export let SetDerived = x => x

export let Hash = ({node, edges, corners}) => H.of(
  node.hash,
  H.ofHashedArray(edges),
  H.ofArray(corners)
)

export let Equal = (a, b) => {
  if (a.node !== b.node) return false

  for (let i = 0; i < 4; i++)
    if (a.edges[i] !== b.edges[i] || a.corners[i] !== b.corners[i])
      return false

  return true
}