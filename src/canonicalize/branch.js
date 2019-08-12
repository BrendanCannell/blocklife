import CanonicalizeConstructor from "./constructor"
import {Canon} from "../context"
import * as U from "../util"
let Canonicalizable = {EqualBranch, HashBranch, SetDerivedBranch}
export default CanonicalizeConstructor(
    'Branch',
    U.stripRight('Branch')(Canonicalizable),
    Canon.Branch)

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
function SetDerivedBranch(branch, hash) {
  branch.hash = hash
  var population = 0
  for (let i = 0; i < 4; i++) {
    population += branch[i].population
    branch.edges[i] = CanonicalizedNewEdge(i, branch)
    branch.corners[i] = branch[i].corners[i]
  }
  branch.population = population
  return branch
}