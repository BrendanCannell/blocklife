import CanonicalizeConstructor from "./constructor"
import * as U from "../util"
let Canonicalizable = {EqualBranch, HashBranch, SetDerivedBranch}
export default CanonicalizeConstructor('Branch', U.stripRight('Branch')(Canonicalizable))

function EqualBranch(a, b) {
  for (let i = 0; i < 4; i++)
    if (a[i] !== b[i]) return false
  return true
}

import {ofHashedArray} from "../fnv-hash"
function HashBranch(branch) {
  return ofHashedArray(branch)
}

import CanonicalizeEdgeConstructor from "./edge"
import {Edge as NewEdge} from "../new"
let CanonicalizedNewEdge = CanonicalizeEdgeConstructor(NewEdge)
function SetDerivedBranch(ctx, branch, hash) {
  let s = branch[0].size
  branch.hash = hash
  var population = 0
  for (let i = 0; i < 4; i++) {
    if (branch[i].size !== s) {
      console.log(branch)
      throw Error('Size mismatch')
    }
    population += branch[i].population
    branch.edges[i] = CanonicalizedNewEdge(ctx, i, branch)
    branch.corners[i] = branch[i].corners[i]
  }
  branch.population = population
  return branch
}