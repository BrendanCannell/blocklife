import CanonicalConstructor from "../canonical-constructor"
import {Canon} from "../context"
export default CanonicalConstructor(
  Canonicalizable(),
  Canon.Branch
)

import * as U from "../util"
import {of} from "../fnv-hash"
import ECC from "../edge/canonical-constructor"
import EN from "../edge/new"

function Canonicalizable({NewEdge, Child: {Hash, Population, Edge, Corner}} = defaults()) {
  let Canonicalizable = {BranchEqual, BranchHash, BranchSetDerived}
  return U.stripLeft('Branch')(Canonicalizable)

  function BranchEqual(a, b) {
    for (let i = 0; i < 4; i++)
      if (a[i] !== b[i]) return false
    return true
  }

  function BranchHash(branch) {
    return of(
      Hash(branch[0]),
      Hash(branch[1]),
      Hash(branch[2]),
      Hash(branch[3])
    )
  }

  function BranchSetDerived(branch, hash) {
    branch.hash = hash
    var population = 0
    for (let i = 0; i < 4; i++) {
      population += Population(branch[i])
      let [sq0, sq1] = EDGE_QUADRANTS[i]
        , e0 = Edge(branch[sq0], i)
        , e1 = Edge(branch[sq1], i)
      branch.edges[i] = NewEdge(e0, e1)
      branch.corners[i] = Corner(branch[i], i)
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

function defaults() {
  return {
    NewEdge: ECC(EN),
    Child: {
      Hash: (c) => c.hash,
      Population: (c) => c.population,
      Edge: (c, direction) => c.edges[direction],
      Corner: (c, direction) => c.corners[direction]
    }
  }
}