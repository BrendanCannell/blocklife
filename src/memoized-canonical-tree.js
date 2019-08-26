import * as U from "./util"
import Fix from "./fix-tree"
import {SIZE as LEAF_SIZE} from "./leaf32/constants"

import {Malloc as MallocCtx} from "./context"
let Malloc = U.map(MC => (...args) => MC()(...args))(MallocCtx)

import MN from "./memoize-next"
// let MemoizeNext = fn => fn
let MemoizeNext = MN({LEAF_SIZE, Malloc: Malloc.Neighborhood})

import CanonicalBranchConstructor from "./branch/canonical-constructor"
import CanonicalLeafConstructor from "./leaf32/canonical-constructor"

import BCopy from "./branch/copy"
import BFromLiving from "./branch/from-living"
import BGet from "./branch/get"
import BLiving from "./branch/living"
import BNext from "./branch/next"
import BSet from "./branch/set"
let Branch = U.stripLeft('B')({
  BCopy,
  BFromLiving,
  BGet,
  BLiving,
  BNext,
  BSet,
})

import LCopy from "./leaf32/copy"
import LFromLiving from "./leaf32/from-living"
import LGet from "./leaf32/get"
import LLiving from "./leaf32/living"
import LNext from "./leaf32/next"
import LSet from "./leaf32/set"
let Leaf = U.stripLeft('L')({
  LCopy,
  LFromLiving,
  LGet,
  LLiving,
  LNext,
  LSet,
})

let Lift = xf => fn => (...args) => xf(fn(...args))
  , LiftNamed = namedArg => fn => (args = {}) => fn({...namedArg, ...args})
  , Configure = (C8ize, Malloc, {Copy, FromLiving, Get, Living, Next, Set}) => {
      let MallocAndC8ize = fn => Lift(C8ize)(LiftNamed({Malloc})(fn))
      return {
        Get,
        Living,
        Copy:       MallocAndC8ize(Copy),
        FromLiving: MallocAndC8ize(FromLiving),
        Set:        MallocAndC8ize(Set),
        Next: Lift(MemoizeNext)(MallocAndC8ize(Next))
      }
    }
  , configured = {
    Leaf:   Configure(CanonicalLeafConstructor,   Malloc.Leaf,   Leaf),
    Branch: Configure(CanonicalBranchConstructor, Malloc.Branch, Branch)
  }
  , fixed = U.map(Fix(LEAF_SIZE))(U.zip(configured))
  , named = U.map(U.setName)(fixed)

import BBlur from "./branch/blur"
import LBlur from "./leaf32/blur"
import BlurBuffer from "./blur-buffer"
let BB = BlurBuffer({
  Branch: BBlur,
  Leaf: LBlur,
  LEAF_SIZE
})

export default {
  ...named,
  BlurBuffer: BB.New,
  AddToBlur: BB.Add,
  DrawBlur: BB.Draw,
  LEAF_SIZE
}