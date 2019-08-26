import CanonicalizeConstructor from "../canonical-constructor"
import {Canon} from "../context"
export default CanonicalizeConstructor(
  Canonicalizable(),
  Canon.Edge
)

import * as U from "../util"
import {ofArray, ofHashedArray} from "../fnv-hash"
function Canonicalizable() {
  let Canonicalizable = {EdgeEqual, EdgeHash, EdgeSetDerived}
  return U.stripLeft('Edge')(Canonicalizable)

  function EdgeEqual(a, b) {
    return a[0] === b[0] && a[1] === b[1]
  }

  function EdgeHash(e) {
    let isLeaf = typeof e[0] === 'number'
    return isLeaf ? ofArray(e) : ofHashedArray(e)
  }

  function EdgeSetDerived(edge, hash) {
    edge.hash = hash
    return edge
  }
}