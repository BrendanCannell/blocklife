import * as U from "../util"
import * as L from "../leaf"
import {Malloc as GetMalloc} from "../context"
import C8izeLeaf from "../canonicalize/leaf"
import C8izeBranch from "../canonicalize/branch"
import MemoizeNext from "../memoize-next"

import * as Add from "./add"
import * as Copy from "./copy"
import * as FromLiving from "./from-living"
import * as Get from "./get"
import * as Living from "./living"
import * as Next from "./next"
import * as Set from "./set"

let Malloc = GetMalloc => (...args) => GetMalloc()(...args)
  , Lift = xf => fn => (...args) => xf(fn(...args))
  , LiftNamed = namedArg => fn => (args = {}) => fn({...namedArg, ...args})
  , byType = U.zip({Add, Copy, FromLiving, Get, Living, Next, Set})
  , Configure = Configure = (C8ize, Malloc, {Add, Copy, FromLiving, Get, Living, Next, Set}) => {
      let MallocAndC8ize = fn => Lift(C8ize)(LiftNamed({Malloc})(fn))
      return {
        Add,
        Get,
        Living,
        Copy:       MallocAndC8ize(Copy),
        FromLiving: MallocAndC8ize(FromLiving),
        Set:        MallocAndC8ize(Set),
        Next: Lift(MemoizeNext)(MallocAndC8ize(Next))
      }
    }
  , configured = {
    Leaf:   Configure(C8izeLeaf, Malloc(GetMalloc.Leaf), byType.Leaf),
    Branch: Configure(C8izeBranch, Malloc(GetMalloc.Branch), byType.Branch)
  }
  , fixed = U.map(Fix)(U.zip(configured))
  , named = U.map(U.setName)(fixed)

export default named

// Tying the knot for a single grid function
function Fix({Leaf, Branch}) {
  let LeafCase = Leaf()
    , BranchCase = Branch({Recur: GridSwitch})
  function GridSwitch(size, ...rest) {
    let Case = size === L.SIZE ? LeafCase : BranchCase
    return Case(size, ...rest)
  }
  return GridSwitch
}