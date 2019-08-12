import CanonicalizeConstructor from "./constructor"
import {Canon} from "../context"
import * as U from "../util"

let Canonicalizable = {EqualNeighborhood, HashNeighborhood, SetDerivedNeighborhood}
export default CanonicalizeConstructor(
    'Neighborhood',
    U.stripRight('Neighborhood')(Canonicalizable),
    Canon.Neighborhood)

function EqualNeighborhood(a, b) {
  if (a.node !== b.node) return false
  for (let i = 0; i < 4; i++)
    if (a.edges[i] !== b.edges[i] || a.corners[i] !== b.corners[i])
      return false
  return true
}

import * as L from "../leaf"
import {of, ofArray, ofHashedArray} from "../fnv-hash"
function HashNeighborhood({size, node, edges, corners}) {
  let edgeHash = size === L.SIZE ? ofArray(edges) : ofHashedArray(edges)
  return of(node.hash, edgeHash, ofArray(corners))
} 

function SetDerivedNeighborhood(neighborhood) {
  neighborhood.next = null
  return neighborhood
}