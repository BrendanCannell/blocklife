import * as U from "../util"
import FixBySize from "../fix-by-size"
import FixByNode from "../fix-by-node"
import {SIZE as LEAF_SIZE} from "../leaf32/constants"

import {
  Allocate as AllocateCtx,
  CopyMemoTable as CopyMemoTableCtx
} from "../context"
let Allocate = U.map(AC => (...args) => AC()(...args))(AllocateCtx)

import MemoizeNext from "../memoize-next"
import MemoizeCopy from "../memoize-copy"
import Leaf from "./leaf"
import Edge from "./edge"
import Branch from "./branch"
import Render from "./render"

let Lift = xf => fn => (...args) => xf(fn(...args))
let LiftNamed = namedArgs => fn => (args = {}) => fn({...namedArgs, ...args})

let MN = MemoizeNext({
      Allocate: Allocate.Neighborhood,
      Branch, Leaf, Edge
    })
let ConfigureRecursiveConstructors = ({CanonicalizeConstructor, Allocate, Copy, FromLiving, Next, Set}) => {
      let AllocateAndC8ize = fn => Lift(CanonicalizeConstructor)(LiftNamed({Allocate})(fn))
        , MC = MemoizeCopy({MemoTable: CopyMemoTableCtx}) 
      return {
        Copy: Lift(MC)(AllocateAndC8ize(Copy)),
        FromLiving: AllocateAndC8ize(FromLiving),
        Set: AllocateAndC8ize(Set),
        Next: Lift(MN)(AllocateAndC8ize(Next))
      }
    }
let recursiveConstructors = U.zip(U.map(ConfigureRecursiveConstructors)({Leaf, Branch}))
let pickRecursiveGetters = U.pick(['BoundingRect', 'Get', 'Living'])
let recursiveGetters = U.zip(U.map(pickRecursiveGetters)({Leaf, Branch}))
let toFixByNode = {...recursiveGetters, ...U.pick(['Copy', 'Next', 'Set'])(recursiveConstructors)}
let toFixBySize = U.pick(['FromLiving'])(recursiveConstructors)
let fixed = {
      ...U.map(FixByNode(LEAF_SIZE))(toFixByNode),
      ...U.map(FixBySize(LEAF_SIZE))(toFixBySize)
    }
let fixedCopy = fixed.Copy
let memoTable = new Map()
let memoTableAccessors = {
      GetMemo: key => memoTable.get(key),
      SetMemo: (key, value) => memoTable.set(key, value)
    }
let withCopyUsingMemoTable = {
      ...fixed,
      Copy: (...args) => {
        memoTable.clear()
        return CopyMemoTableCtx.let(memoTableAccessors, () => fixedCopy(...args))
      },
    }
let withGetters = {
      ...withCopyUsingMemoTable,
      GetHash: node => {
        let GetHash = node.size === LEAF_SIZE ? Leaf.GetHash : Branch.GetHash
        return GetHash(node)
      },
      GetPopulation: node => {
        let GetPopulation = node.size === LEAF_SIZE ? Leaf.GetPopulation : Branch.GetPopulation
        return GetPopulation(node)
      }
    }
let withNewBranch = {
      ...withGetters,
      NewBranch: Branch.New
    }
let named = U.map(U.setName)(withNewBranch)

export default {
  ...named,
  Render,
  LEAF_SIZE
}