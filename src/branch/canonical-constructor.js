import CanonicalConstructor from "../canonical-constructor"
import {Canon} from "../context"
export default opts => CanonicalConstructor(
  Canonicalizable(opts),
  Canon.Branch
)

import * as U from "../util"
import {ofArray} from "../fnv-hash"
import BranchEqual from "./equal"
import BranchGetCorner from "./get-corner"
import BranchGetEdge from "./get-edge"
import BranchGetHash from "./get-hash"
import BranchGetPopulation from "./get-population"
function Canonicalizable({EdgeNew, LEAF_SIZE, LeafGetHash, LeafGetPopulation, LeafGetEdge, LeafGetCorner}) {
  let Canonicalizable = {BranchEqual, BranchHash, BranchSetDerived}
  return U.stripLeft('Branch')(Canonicalizable)

  function HasLeafChildren(branch) {
    return branch.size === LEAF_SIZE * 2
  }

  function BranchHash(branch) {
    if (HasLeafChildren(branch))
      for (let i = 0; i < 4; i++)
        subhashes[i] = LeafGetHash(branch[i])
    else
      for (let i = 0; i < 4; i++)
        subhashes[i] = BranchGetHash(branch[i])
    return ofArray(subhashes)
  }

  function BranchSetDerived(branch, hash) {
    return HasLeafChildren(branch)
      ? BranchWithLeafChildrenSetDerived(branch, hash)
      : BranchWithBranchChildrenSetDerived(branch, hash)
  }

  function BranchWithLeafChildrenSetDerived(branch, hash) {
    branch.hash = hash
    var population = 0
    for (let i = 0; i < 4; i++) {
      let [sq0, sq1] = EDGE_QUADRANTS[i]
        , e0 = LeafGetEdge(branch[sq0], i)
        , e1 = LeafGetEdge(branch[sq1], i)
      branch.edges[i] = EdgeNew(e0, e1)
      branch.corners[i] = LeafGetCorner(branch[i], i)
      population += LeafGetPopulation(branch[i])
    }
    branch.population = population
    return branch
  }

  function BranchWithBranchChildrenSetDerived(branch, hash) {
    branch.hash = hash
    var population = 0
    for (let i = 0; i < 4; i++) {
      let [sq0, sq1] = EDGE_QUADRANTS[i]
        , e0 = BranchGetEdge(branch[sq0], i)
        , e1 = BranchGetEdge(branch[sq1], i)
      branch.edges[i] = EdgeNew(e0, e1)
      branch.corners[i] = BranchGetCorner(branch[i], i)
      population += BranchGetPopulation(branch[i])
    }
    branch.population = population
    return branch
  }
}

import * as D from "../direction"
const EDGE_QUADRANTS = [
  [D.NW, D.NE],
  [D.SW, D.SE],
  [D.NW, D.SW],
  [D.NE, D.SE]
]

const subhashes = [0,0,0,0]