import * as U from "./util"
import FixBySize from "./fix-by-size"
import FixByNode from "./fix-by-node"
import {SIZE as LEAF_SIZE} from "./leaf32/constants"

import {
  Malloc as MallocCtx,
  CopyMemoTable as CopyMemoTableCtx
} from "./context"
let Malloc = U.map(MC => (...args) => MC()(...args))(MallocCtx)

import ToCanonicalizeBranchConstructor from "./branch/canonical-constructor"
import ToCanonicalizeEdgeConstructor from "./edge/canonical-constructor"
import ToCanonicalizeLeafConstructor from "./leaf32/canonical-constructor"
import MemoizeNext from "./memoize-next"
import MemoizeCopy from "./memoize-copy"

let CanonicalizeEdgeConstructor = ToCanonicalizeEdgeConstructor()
  , CanonicalizeLeafConstructor = ToCanonicalizeLeafConstructor()

let Lift = xf => fn => (...args) => xf(fn(...args))
  , LiftNamed = namedArgs => fn => (args = {}) => fn({...namedArgs, ...args})

import LeafCopy from "./leaf32/copy"
import LeafFromLiving from "./leaf32/from-living"
import LeafGet from "./leaf32/get"
import LeafGetHash from "./leaf32/get-hash"
import LeafGetPopulation from "./leaf32/get-population"
import LeafGetEdge from "./leaf32/get-edge"
import LeafGetCorner from "./leaf32/get-corner"
import LeafLiving from "./leaf32/living"
import LeafNext from "./leaf32/next"
import LeafSet from "./leaf32/set"
let Leaf = U.stripLeft('Leaf')({
  LeafCopy,
  LeafFromLiving,
  LeafGet,
  LeafGetHash,
  LeafGetPopulation,
  LeafLiving,
  LeafNext,
  LeafSet,
})

import EdgeCopy from "./edge/copy"
import EdgeGetHash from "./edge/get-hash"
import EdgeNew from "./edge/new"
let CanonicalEdgeNew = CanonicalizeEdgeConstructor(EdgeNew({Malloc: Malloc.Edge}))
let CanonicalizeBranchConstructor = ToCanonicalizeBranchConstructor({
  EdgeNew: CanonicalEdgeNew,
  LEAF_SIZE,
  LeafGetHash,
  LeafGetPopulation,
  LeafGetEdge,
  LeafGetCorner
})

let MemoizedEdgeCopy =
  MemoizeCopy({MemoTable: CopyMemoTableCtx})(
    CanonicalizeEdgeConstructor(
      EdgeCopy({
        Malloc: Malloc.Edge,
        Recur: edge => MemoizedEdgeCopy(edge)
      })
    )
  )
import BranchCopy from "./branch/copy"
import BranchFromLiving from "./branch/from-living"
import BranchGet from "./branch/get"
import BranchGetHash from "./branch/get-hash"
import BranchGetPopulation from "./branch/get-population"
import BranchGetEdge from "./branch/get-edge"
import BranchGetCorner from "./branch/get-corner"
import BranchLiving from "./branch/living"
import BranchNew from "./branch/new"
import BranchNext from "./branch/next"
import BranchSet from "./branch/set"
let Branch = U.stripLeft('Branch')({
  BranchCopy: LiftNamed({EdgeCopy: MemoizedEdgeCopy})(BranchCopy),
  BranchFromLiving,
  BranchGet,
  BranchGetHash,
  BranchGetPopulation,
  BranchLiving,
  BranchNew,
  BranchNext,
  BranchSet,
})

let MN = MemoizeNext({
      LEAF_SIZE,
      Malloc: Malloc.Neighborhood,
      LeafGetEdge,
      LeafGetCorner,
      BranchGetEdge,
      BranchGetCorner,
      EdgeGetHash,
      NodeGetHash: node => node.size === LEAF_SIZE ? LeafGetHash(node) : BranchGetHash(node)
    })
  , Configure = (C8ize, Malloc, {Copy, FromLiving, Get, Living, Next, Set, New}) => {
      let MallocAndC8ize = fn => Lift(C8ize)(LiftNamed({Malloc})(fn))
        , MC = MemoizeCopy({GetOriginal: obj => obj, MemoTable: CopyMemoTableCtx}) 
      return {
        Get,
        Living,
        Copy: Lift(MC)(MallocAndC8ize(Copy)),
        FromLiving: MallocAndC8ize(FromLiving),
        Set: MallocAndC8ize(Set),
        Next: Lift(MN)(MallocAndC8ize(Next))
      }
    }
  , configured = U.zip({
      Leaf:   Configure(CanonicalizeLeafConstructor,   Malloc.Leaf,   Leaf),
      Branch: Configure(CanonicalizeBranchConstructor, Malloc.Branch, Branch)
    })
  , toFixByNode = U.pick(['Copy', 'Get', 'Living', 'Next', 'Set'])(configured)
  , toFixBySize = U.pick(['FromLiving'])(configured)
  , fixed = {
      ...U.map(FixByNode(LEAF_SIZE))(toFixByNode),
      ...U.map(FixBySize(LEAF_SIZE))(toFixBySize)
    }
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
  , withGetters = {
      ...withCopyMemoTable,
      GetHash: node => {
        let GetHash = node.size === LEAF_SIZE ? LeafGetHash : BranchGetHash
        return GetHash(node)
      },
      GetPopulation: node => {
        let GetPopulation = node.size === LEAF_SIZE ? LeafGetPopulation : BranchGetPopulation
        return GetPopulation(node)
      }
    }
  , withNewBranch = {
      ...withGetters,
      NewBranch: CanonicalizeBranchConstructor(BranchNew({Malloc: Malloc.Branch}))
    }
  , named = U.map(U.setName)(withNewBranch)

import BRender from "./branch/render"
import LRender from "./leaf32/render"
let Render = (() => {
  let LeafCase = LRender()
    , BranchCase = BRender({Recur: NodeSwitch})
  return NodeSwitch

  function NodeSwitch(node, left, top, renderCfg) {
    let v = renderCfg.viewport
      , size = node.size
      , right  = left + size
      , bottom = top  + size
      , overlapsViewport =
             left   < v.right
          && right  > v.left
          && top    < v.bottom
          && bottom > v.top
    if (!overlapsViewport || node.population === 0) return
    let Case = size === LEAF_SIZE ? LeafCase : BranchCase
    return Case(node, left, top, renderCfg)
  }
})()



export default {
  ...named,
  Render,
  LEAF_SIZE
}