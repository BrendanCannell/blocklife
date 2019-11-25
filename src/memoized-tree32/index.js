import * as U from "../util"
import * as D from "../direction"

import {
  Allocate as AllocateCtx
} from "../context"
let Allocate = U.map(AC => (...args) => AC()(...args))(AllocateCtx)

import ToMemoizeNext from "../memoize-next"
import ToMemoizeSetMany from "../memoize-set-many"
import MemoizeWithTable from "../memoize-with-table"
import WithClearedMemoTable from "../with-cleared-memo-table"
import Leaf from "./leaf"
import Edge from "./edge"
import Branch from "./branch"
import Render from "./render"

import ToFixByArg0 from "../fix-by-arg0"
import ToFixByArg0Size from "../fix-by-arg0-size"
import ToDispatchByArg0Size from "../dispatch-by-arg0-size"
let FixByArg0 = ToFixByArg0(Leaf.SIZE)
let FixByArg0Size = ToFixByArg0Size(Leaf.SIZE)
let DispatchByArg0Size = ToDispatchByArg0Size(Leaf.SIZE)

// Configure each case of each recursive functions, where needed
// Because the branch cases can't be provided with their recursive callbacks until the end, the branch case configuration involves some extra function composition and partial application.

let recursiveFnNames = {
  constructors: ['Copy', 'FromLiving', 'Next', 'SetMany'],
  byArg0: {
    node: ['BoundingRect', 'Copy', 'Get', 'Living', 'Next', 'SetMany'],
    size: ['FromLiving'],
  }
}

// Allocation
for (let f of recursiveFnNames.constructors) {
  Leaf  [f] =              (Leaf  [f])({Allocate: Allocate.Leaf  })
  Branch[f] = U.partialOpts(Branch[f])({Allocate: Allocate.Branch})
}

// Canonicalization
for (let f of recursiveFnNames.constructors) {
  Leaf  [f] =          (Leaf  .CanonicalizeConstructor)(Leaf  [f])
  Branch[f] = U.compose(Branch.CanonicalizeConstructor)(Branch[f])
}

// Memoization
let MemoizeNext = ToMemoizeNext({Allocate: Allocate.Neighborhood, Branch, Leaf, Edge})
Leaf  .Next =          (MemoizeNext)(Leaf  .Next)
Branch.Next = U.compose(MemoizeNext)(Branch.Next)

let setMemoTable = new Map()
let MemoizeSetMany = ToMemoizeSetMany(setMemoTable)
Leaf  .SetMany =          (MemoizeSetMany)(Leaf  .SetMany)
Branch.SetMany = U.compose(MemoizeSetMany)(Branch.SetMany)

let copyMemoTable = new Map()
let MemoizeCopy = MemoizeWithTable(copyMemoTable)
Leaf  .Copy =          (MemoizeCopy)(Leaf  .Copy)
Branch.Copy = U.compose(MemoizeCopy)(Branch.Copy)

// Fix
let Tree = {}
let T = Tree
for (let f of recursiveFnNames.byArg0.node) {
  T[f] = FixByArg0Size({Branch: Branch[f], Leaf: Leaf[f]})
}
for (let f of recursiveFnNames.byArg0.size) {
  T[f] = FixByArg0({Branch: Branch[f], Leaf: Leaf[f]})
}

// Entry point config
T.SetMany  = WithClearedMemoTable(setMemoTable) (T.SetMany)
T.Copy = WithClearedMemoTable(copyMemoTable)(T.Copy)

// Non-recursive config
let nonrecursiveFnNames = ['GetEdge', 'GetHash', 'GetPopulation', 'GetSize']
for (let f of nonrecursiveFnNames) {
  T[f] = DispatchByArg0Size({Branch: Branch[f], Leaf: Leaf[f]})
}

// Misc
T.GetEdgePopulation = function GetEdgePopulation(tree, direction) {
  let edge = T.GetEdge(tree, direction)
  return Edge.GetPopulation(edge)
}
T.Grow = function Grow(oldTree) {
  let oldSize = T.GetSize(oldTree)
  let emptyGrandchild = T.FromLiving(oldSize / 2, [])
  let size = oldSize * 2
  let e = emptyGrandchild, t = T.Copy(oldTree)
  let grownTree = Branch.New(
    size,
    Branch.New(oldSize, e, e, e, t[D.NW]),
    Branch.New(oldSize, e, e, t[D.NE], e),
    Branch.New(oldSize, e, t[D.SW], e, e),
    Branch.New(oldSize, t[D.SE], e, e, e)
  )
  return grownTree
}
T.Render = Render
T.LEAF_SIZE = Leaf.SIZE
T = U.map((val, key) => typeof val === 'function' ? U.setName(val, key) : val)(T)

export default T