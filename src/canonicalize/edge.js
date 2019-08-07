import CanonicalizeConstructor from "./constructor"
import * as U from "../util"
let Canonicalizable = {EqualEdge, HashEdge, SetDerivedEdge}
export default CanonicalizeConstructor('Edge', U.stripRight('Edge')(Canonicalizable))

function EqualEdge(a, b) {
  return a[0] === b[0] && a[1] === b[1]
}

import {ofArray, ofHashedArray} from "../fnv-hash"
function HashEdge(e) {
  let isLeaf = typeof e[0] === 'number'
  return isLeaf ? ofArray(e) : ofHashedArray(e)
}

function SetDerivedEdge(ctx, edge, hash) {
  edge.hash = hash
  return edge
}