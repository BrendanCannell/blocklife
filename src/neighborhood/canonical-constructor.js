import CanonicalConstructor from "../canonical-constructor"
import {Canon} from "../context"
const subhashes = [0,0,0,0,0,0,0,0,0]
export default (opts) => CanonicalConstructor(
  Canonicalizable(opts),
  Canon.Neighborhood
)

import * as U from "../util"
import {of, ofArray} from "../fnv-hash"
function Canonicalizable({LEAF_SIZE, NodeGetHash, EdgeGetHash, Next}) {
  let Canonicalizable = {NeighborhoodEqual, NeighborhoodHash, NeighborhoodSetDerived}
  return U.stripLeft('Neighborhood')(Canonicalizable)

  function NeighborhoodEqual(a, b) {
    if (a.node !== b.node) return false
    for (let i = 0; i < 4; i++)
      if (a.edges[i] !== b.edges[i] || a.corners[i] !== b.corners[i])
        return false
    return true
  }

  function NeighborhoodHash({node, edges, corners}) {
    subhashes[0] = NodeGetHash(node)
    for (let i = 0; i < 4; i++) {
      subhashes[i+1] = EdgeGetHash(edges[i])
      subhashes[i+5] = corners[i]
    }
    return ofArray(subhashes)
  }

  function NeighborhoodSetDerived(neighborhood, hash) {
    let {node, neighbors} = neighborhood
    neighborhood.hash = hash
    neighborhood.next = Next(node, ...neighbors)
    return neighborhood
  }
}