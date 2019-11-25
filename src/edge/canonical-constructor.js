import CanonicalizeConstructor from "../canonical-constructor"
import {Canon} from "../context"
export default () => CanonicalizeConstructor(
  Canonicalizable(),
  Canon.Edge
)

import * as U from "../util"
import {of} from "../fnv-hash"
import {HASH} from "./constants"
import EdgeEqual from "./equal"
function Canonicalizable() {
  let Canonicalizable = {EdgeEqual, EdgeHash, EdgeSetDerived}
  return U.stripLeft('Edge')(Canonicalizable)

  function EdgeHash(e) {
    let isLeaf = typeof e[0] === 'number'
    return isLeaf ? of(e[0], e[1]) : of(e[0][HASH], e[1][HASH])
  }

  function EdgeSetDerived(edge, hash) {
    let hasLeafChildren = typeof edge[0] === 'number'
    edge[HASH] = hash
    return edge
  }
}