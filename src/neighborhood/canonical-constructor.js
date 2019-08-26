import CanonicalConstructor from "../canonical-constructor"
import {Canon} from "../context"
export default ({LEAF_SIZE, Next}) => CanonicalConstructor(
  Canonicalizable({LEAF_SIZE, Next}),
  Canon.Neighborhood
)

import * as U from "../util"
import {of, ofArray, ofHashedArray} from "../fnv-hash"
function Canonicalizable({LEAF_SIZE, Next}) {
  let Canonicalizable = {NeighborhoodEqual, NeighborhoodHash, NeighborhoodSetDerived}
  return U.stripLeft('Neighborhood')(Canonicalizable)

  function NeighborhoodEqual(a, b) {
    if (a.node !== b.node) return false
    for (let i = 0; i < 4; i++)
      if (a.edges[i] !== b.edges[i] || a.corners[i] !== b.corners[i])
        return false
    return true
  }

  function NeighborhoodHash({size, node, edges, corners}) {
    let edgeHash = size === LEAF_SIZE ? ofArray(edges) : ofHashedArray(edges)
    return of(node.hash, edgeHash, ofArray(corners))
  } 

  function NeighborhoodSetDerived(neighborhood) {
    let {size, node, neighbors} = neighborhood
    neighborhood.next = Next(size, node, ...neighbors)
    return neighborhood
  }
}