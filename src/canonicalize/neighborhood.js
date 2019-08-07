import CanonicalizeConstructor from "./constructor"
import * as U from "../util"
let Canonicalizable = {EqualNeighborhood, HashNeighborhood, SetDerivedNeighborhood}
export default CanonicalizeConstructor('Neighborhood', U.stripRight('Neighborhood')(Canonicalizable))

function EqualNeighborhood(a, b) {
  if (a.node !== b.node) return false
  for (let i = 0; i < 4; i++)
    if (a.edges[i] !== b.edges[i] || a.corners[i] !== b.corners[i])
      return false
  return true
}

import {IsLeaf} from "../leaf"
import {of, ofArray, ofHashedArray} from "../fnv-hash"
function HashNeighborhood({node, edges, corners}) {
  let edgeHash = IsLeaf(node) ? ofArray(edges) : ofHashedArray(edges)
  return of(node.hash, edgeHash, ofArray(corners))
} 

function SetDerivedNeighborhood(ctx, neighborhood) {
  neighborhood.next = null
  return neighborhood
}