import * as U from "../util"

import C8izeLeaf from "../canonicalize/leaf"
import C8izeBranch from "../canonicalize/branch"
let C8ize = Lift({Leaf: C8izeLeaf, Branch: C8izeBranch})

import {default as MN} from "../memoize-next"
let MemoizeNext = Lift({Leaf: MN, Branch: MN})

import * as AddTo from "./add-to"
import * as Copy from "./copy"
import * as FromLiving from "./from-living"
import * as Get from "./get"
import * as Living from "./living"
import * as Next from "./next"
import * as Set from "./set"
let configured = {
      AddTo,
      Get,
      Living,
      Copy:       C8ize(Copy),
      FromLiving: C8ize(FromLiving),
      Set:        C8ize(Set),
      Next: MemoizeNext(C8ize(Next))
    }
  , fixed = U.map(Fix)(configured)
  , named = U.map(U.setName)(fixed)

export default named

// Wrap the branch constructor transformer to allow fixing
function Lift(CaseXFs) {
  return Cases => ({
    Leaf: CaseXFs.Leaf(Cases.Leaf),
    Branch: ({Recur}) => CaseXFs.Branch(Cases.Branch({Recur}))
  })
}

// Tying the knot for a single grid function
import {IsLeaf} from "../leaf"
function Fix({Leaf, Branch}) {
  let LeafCase = Leaf
  let BranchCase = Branch({Recur: GridSwitch})
  function GridSwitch(ctx, gridOrSize, ...rest) {
    let Case = IsLeaf(gridOrSize) ? LeafCase : BranchCase

    return Case(ctx, gridOrSize, ...rest)
  }
  return GridSwitch
}