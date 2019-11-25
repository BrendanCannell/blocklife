import * as U from "../util"
import FixByArg0 from "../fix-by-arg0"
import FixByArg0Size from "../fix-by-arg0-size"
import {SIZE as LEAF_SIZE} from "../leaf32/constants"

import {
  Allocate as AllocateCtx
} from "../context"
let Allocate = U.map(AC => (...args) => AC()(...args))(AllocateCtx)

import MemoizeNext from "../memoize-next"
import MemoizeWithTable from "../memoize-with-table"
import WithClearedMemoTable from "../with-cleared-memo-table"
import Leaf from "./leaf"
import Edge from "./edge"
import Branch from "./branch"
import Render from "./render"

// Configure each case of each recursive functions, where needed
// Because the branch cases can't be provided with their recursive callbacks until the end, their configuration involves some extra function composition and partial application.

let recursiveFnNames = {
  constructors: ['Copy', 'FromLiving', 'Next', 'Set'],
  byArg0: {
    node: ['BoundingRect', 'Copy', 'Get', 'Living', 'Next', 'Set'],
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
let MN = MemoizeNext({Allocate: Allocate.Neighborhood, Branch, Leaf, Edge})
Leaf  .Next =          (MN)(Leaf  .Next)
Branch.Next = U.compose(MN)(Branch.Next)

let copyMemoTable = new Map()
let UMT = MemoizeWithTable(copyMemoTable)
Leaf  .Copy =          (UMT)(Leaf  .Copy)
Branch.Copy = U.compose(UMT)(Branch.Copy)

// Fix
let Tree = {}
for (let f of recursiveFnNames.byArg0.node) {
  Tree[f] = FixByArg0Size(LEAF_SIZE)({Branch: Branch[f], Leaf: Leaf[f]})
}
for (let f of recursiveFnNames.byArg0.size) {
  Tree[f] = FixByArg0(LEAF_SIZE)({Branch: Branch[f], Leaf: Leaf[f]})
}

// Entry point config
Tree.Copy = WithClearedMemoTable(copyMemoTable)(Tree.Copy)

// Non-recursive config
Tree.GetHash = SwitchByNode('GetHash')
Tree.GetPopulation = SwitchByNode('GetPopulation')
Tree.GetSize = SwitchByNode('GetSize')

// Misc
Tree.NewBranch = Branch.New
Tree.Render = Render
Tree = U.map(U.setName)(Tree)
Tree.LEAF_SIZE = LEAF_SIZE

export default Tree

function SwitchByNode(name) {
  let LeafCase   = Leaf[name]
  let BranchCase = Branch[name]
  return node => node.size === LEAF_SIZE
    ? LeafCase(node)
    : BranchCase(node)
}