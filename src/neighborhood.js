import * as H from "./hash"
import * as D from "./direction"
import * as G from "./edge"
import isLeaf from "./isLeaf"

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
  
  raw.edges[D.N] = N.edges[D.N]
  raw.edges[D.S] = S.edges[D.S]
  raw.edges[D.W] = W.edges[D.E]
  raw.edges[D.E] = E.edges[D.W]

  raw.corners[D.NW] = NW.corners[D.SE]
  raw.corners[D.NE] = NE.corners[D.SW]
  raw.corners[D.SW] = SW.corners[D.NE]
  raw.corners[D.SE] = SE.corners[D.NW]

  raw.next = null

  return raw
}

export let SetDerived = x => x

export let Hash = ({node, edges, corners}) => H.of(
  node.hash,
  isLeaf(node) ? H.ofArray(edges) : H.ofHashedArray(edges),
  H.ofArray(corners)
)

export let Equal = (a, b) => {
  if (a.node !== b.node) return false

  for (let i = 0; i < 4; i++)
    if (a.edges[i] !== b.edges[i] || a.corners[i] !== b.corners[i])
      return false

  return true
}