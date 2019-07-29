import Store from "./canonical-store"
import * as Leaf from "./leaf"
import * as Branch from "./branch"
import * as Neighborhood from "./neighborhood"
import * as Edge from "./edge"
import Canonicalize from "./canonicalize"
import {apply, pick, map, go, lift, liftOpts, name, pipe, pipeCtx, withNames} from "./util"

let SetMalloc = moduleKey => apply({Malloc: ctx => ctx[moduleKey].Malloc()})

let Tree = () =>  {
  let store = Store({Leaf, Branch, Neighborhood, Edge})

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

  let MemoizedBranch = (({NewEdge}) => {
    let B = {
      ...Branch,
      SetDerived: Branch.SetDerived({NewEdge})
    }

    let BranchStore = ctx => ctx.Branch

    let BranchMalloc = ctx => BranchStore(ctx).Malloc()

    // ({Malloc} -> A) -> A
    let SetMalloc = apply({Malloc: BranchMalloc})

    // Branch -> Branch
    let C8izeBranch = Canonicalize(B, BranchStore)

    // type BranchFrom = (Ctx, ...A -> Branch)
    // type RequireMalloc = {Malloc} -> BranchFrom
    // type RequireBoth = {Malloc, Recur} -> BranchFrom
    // type ProvideMalloc = RequireMalloc -> BranchFrom
    // type ApplyRecur = RequireBoth -> RequireMalloc

    // BranchFrom -> BranchFrom
    let C8izeBranchConstructor = constructor => pipeCtx([constructor, C8izeBranch])

    // ProvideMalloc
    let ConfigureBranchConstructor = pipe([SetMalloc, C8izeBranchConstructor])

    // RequireBoth -> ApplyRecur -> BranchFrom
    let liftedCBC = lift(ConfigureBranchConstructor)

    // ProvideMalloc
    let ConfigureAndMemoizeNext = pipe([ConfigureBranchConstructor, MemoizeNext])

    // RequireBoth -> ApplyRecur -> BranchFrom
    let liftedCMN = lift(ConfigureAndMemoizeNext)
    
    return {
      ...B,
      // [ApplyRecur -> BranchFrom]
      ...go(B,
          pick(['Copy', 'FromLiving', 'Set']),
          map(liftedCBC)),
      // ApplyRecur -> BranchFrom
      Next: liftedCMN(B.Next),
    }
  })({NewEdge: C8izedEdge})

  let liftOpts2 = fn => afterOpts => beforeOpts => console.log({fn, afterOpts, beforeOpts}) ||
    fn({...beforeOpts, ...afterOpts})

  let FixTree = ({Leaf, Branch: UnliftedBranch}) => {
    let Branch = {
      ...UnliftedBranch,
      ...go(UnliftedBranch,
        pick(['Copy', 'Next', 'Set']),
        // map(constructor => pipe([liftOpts, constructor]))
        map(case_and_malloc_needs_recur => recur =>
          case_and_malloc_needs_recur(caseFn => malloc => caseFn({...malloc, ...recur})))
        // map(liftOpts2)
        )
    }

    let polymorphicFirstArg =
      ['AddTo', 'Copy', 'Next', 'Set', 'Get', 'Equal', 'Living']
        .map(name => [name, Fix(Leaf[name], Branch[name])])

    let FromLiving = (ctx, locations, size) =>
      size === Leaf.SIZE
        ? LeafCase(ctx, locations, size)
        : BranchCase(ctx, locations, size)

    let LeafCase = Leaf.FromLiving
    let BranchCase = Branch.FromLiving(liftOpts({Recur: FromLiving}))
    
    return {
      Leaf,
      Branch: {
        ...Branch,
        ...Object.fromEntries(polymorphicFirstArg),
        FromLiving
      }
    }
  }

  return {
    ...FixTree({Leaf: MemoizedLeaf, Branch: MemoizedBranch}),
    store
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

export default Tree