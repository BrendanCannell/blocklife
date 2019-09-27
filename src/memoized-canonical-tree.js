import * as U from "./util"
import FixBySize from "./fix-by-size"
import {SIZE as LEAF_SIZE} from "./leaf32/constants"

import {
  Malloc as MallocCtx,
  CopyMemoTable as CopyMemoTableCtx
} from "./context"
let Malloc = U.map(MC => (...args) => MC()(...args))(MallocCtx)

import CanonicalBranchConstructor from "./branch/canonical-constructor"
import CanonicalEdgeConstructor from "./edge/canonical-constructor"
import CanonicalLeafConstructor from "./leaf32/canonical-constructor"
import MemoizeNext from "./memoize-next"
import MemoizeCopy from "./memoize-copy"

let Lift = xf => fn => (...args) => xf(fn(...args))
  , LiftNamed = namedArgs => fn => (args = {}) => fn({...namedArgs, ...args})

import ECopy from "./edge/copy"

let EdgeMemoizeCopy = MemoizeCopy({
      GetOriginal: edge => edge,
      MemoTable: CopyMemoTableCtx
    })
  , EdgeCopy = EdgeMemoizeCopy(CanonicalEdgeConstructor(ECopy({
      Malloc: Malloc.Edge,
      Recur: edge => EdgeCopy(edge)
    })))

import BCopy from "./branch/copy"
import BFromLiving from "./branch/from-living"
import BGet from "./branch/get"
import BLiving from "./branch/living"
import BNext from "./branch/next"
import BSet from "./branch/set"
let Branch = U.stripLeft('B')({
  BCopy: LiftNamed({EdgeCopy})(BCopy),
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

let MN = MemoizeNext({LEAF_SIZE, Malloc: Malloc.Neighborhood})
  , Configure = (C8ize, Malloc, {Copy, FromLiving, Get, Living, Next, Set}) => {
      let MallocAndC8ize = fn => Lift(C8ize)(LiftNamed({Malloc})(fn))
        , MC = MemoizeCopy({GetOriginal: (_size, obj) => obj, MemoTable: CopyMemoTableCtx}) 
      return {
        Get,
        Living,
        Copy: Lift(MC)(MallocAndC8ize(Copy)),
        FromLiving: MallocAndC8ize(FromLiving),
        Set: MallocAndC8ize(Set),
        Next: Lift(MN)(MallocAndC8ize(Next))
      }
    }
  , configured = {
      Leaf:   Configure(CanonicalLeafConstructor,   Malloc.Leaf,   Leaf),
      Branch: Configure(CanonicalBranchConstructor, Malloc.Branch, Branch)
    }
  , fixed = U.map(FixBySize(LEAF_SIZE))(U.zip(configured))
  , fixedCopy = fixed.Copy
  , memoTable = new Map()
  , getSet = {
      GetMemo: key => memoTable.get(key),
      SetMemo: (key, value) => memoTable.set(key, value)
    }
  , withCopyMemoTable = {
      ...fixed,
      Copy: (...args) => {
        memoTable.clear()
        return CopyMemoTableCtx.let(getSet, () => fixedCopy(...args))
      },
    }
  , named = U.map(U.setName)(withCopyMemoTable)

import BRender from "./branch/render"
import LRender from "./leaf32/render"
let Render = (() => {
  let LeafCase = LRender()
    , BranchCase = BRender({Recur: NodeSwitch})
  return NodeSwitch

  function NodeSwitch(size, node, left, top, renderCfg) {
    let v = renderCfg.viewport
      , right  = left + size
      , bottom = top  + size
      , overlapsViewport =
             left   < v.right
          && right  > v.left
          && top    < v.bottom
          && bottom > v.top
    if (!overlapsViewport || node.population === 0) return
    let Case = size === LEAF_SIZE ? LeafCase : BranchCase
    return Case(size, node, left, top, renderCfg)
  }
})()

export default {
  ...named,
  Render,
  LEAF_SIZE
}