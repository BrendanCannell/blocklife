import Store from "./canonical-store"
import * as Leaf from "./leaf"
import * as Branch from "./branch"
import * as Neighborhood from "./neighborhood"
import * as Edge from "./edge"
import Canonicalize from "./canonicalize"
import {apply, pick, map, go, lift, liftOpts, name, pipe, pipeCtx, withNames} from "./util"

let SetMalloc = moduleKey => apply({Malloc: ctx => ctx[moduleKey].Malloc()})

let C8izedNeighborhood = pipeCtx([
  Neighborhood.New({Malloc: ({Neighborhood}) => Neighborhood.Malloc()}),
  Canonicalize(Neighborhood, ctx => ctx.Neighborhood)
])

let C8izedEdge = pipeCtx([
  Edge.New({Malloc: ({Edge}) => Edge.Malloc()}),
  Canonicalize(Edge, ctx => ctx.Edge)
])

let MemoizeNext = Next => function memoNext(...args) {
  let neighborhood = C8izedNeighborhood(...args)

  if (!neighborhood.next)
    neighborhood.next = Next(...args)

  return neighborhood.next
}

let MemoizedLeaf = (() => {
  let C8ize = fn => pipeCtx([fn, Canonicalize(Leaf, ctx => ctx.Leaf)])

  let setMalloc = SetMalloc('Leaf')

  return {
    ...Leaf,
    ...go(Leaf,
        pick(['Copy', 'FromLiving', 'Set']),
        map(setMalloc),
        map(C8ize)),
    Next: MemoizeNext(C8ize(setMalloc(Leaf.Next)))
  }
})()

function MemoizeBranch({NewEdge}) {
  let B = {
    ...Branch,
    SetDerived: Branch.SetDerived({NewEdge})
  }

  let BranchStore = ctx => ctx.Branch

  let C8izeBranch = Canonicalize(B, BranchStore)

  let C8izeBranchConstructor = constructor => pipeCtx([constructor, C8izeBranch])

  let BranchMalloc = ctx => BranchStore(ctx).Malloc()

  let ConfigureBranchConstructor = constructor => ({Recur}) => {
    let withOpts = constructor({Malloc: BranchMalloc, Recur})

    return C8izeBranchConstructor(withOpts)
  }
  
  return {
    ...B,
    ...go(B,
      pick(['Copy', 'FromLiving', 'Set']),
      map(ConfigureBranchConstructor)),
    Next: ({Recur}) => MemoizeNext(ConfigureBranchConstructor(B.Next)({Recur})),
  }
}

let FixTree = ({Leaf, Branch}) => {
  let polymorphicFirstArg =
    ['AddTo', 'Copy', 'Next', 'Set', 'Get', 'Equal', 'Living']
      .map(name => [name, Fix(Leaf[name], Branch[name])])

  let FromLiving = (ctx, locations, size) =>
    size === Leaf.SIZE
      ? LeafCase(ctx, locations, size)
      : BranchCase(ctx, locations, size)

  let LeafCase = Leaf.FromLiving
  let BranchCase = Branch.FromLiving({Recur: FromLiving})
  
  return {
    Leaf,
    Branch: {
      ...Branch,
      ...Object.fromEntries(polymorphicFirstArg),
      FromLiving
    }
  }
}

function Fix(LeafCase, ToBranchCase) {
  let SwitchNode = (ctx, node, ...rest) =>
    node.size === Leaf.SIZE
      ? LeafCase(ctx, node, ...rest)
      : BranchCase(ctx, node, ...rest)
      
  let BranchCase = ToBranchCase({Recur: SwitchNode})

  return SwitchNode
}

let FixedTree = FixTree({
  Leaf: MemoizedLeaf,
  Branch: MemoizeBranch({NewEdge: C8izedEdge})
})

let Tree = () =>  {
  let store = Store({Leaf, Branch, Neighborhood, Edge})

  return {
    ...FixedTree,
    store
  }
}

export default Tree