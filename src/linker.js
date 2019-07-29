import * as S from "./store"
import * as Leaf from "./leaf"
import * as Branch from "./branch"
import * as Neighborhood from "./neighborhood"
import * as Edge from "./edge"
import * as C from "./canonicalize"
import {pick, map, go, pipe, pipeCtx} from "./util"

let CanonicalStore = Malloc => {
  let store = S.New(Malloc)
  let hashTable = new Map()

  return {
    ...pick(['Malloc', 'Free'])(store),
    GetCanon: hash => hashTable.get(hash),
    SetCanon: (hash, node) => hashTable.set(hash, node),
    Clear: () => (store.Clear(), hashTable.clear()),
    Show: () => ({
      store: store.Show(),
      hashTable: hashTable.size
    })
  }
}

let Store = () => ({
  Leaf: CanonicalStore(Leaf.Malloc),
  Branch: CanonicalStore(Branch.Malloc),
  Neighborhood: CanonicalStore(Neighborhood.Malloc),
  Edge: CanonicalStore(Edge.Malloc)
})

let Canonicalize = (Module, toStore) =>
  C.WithContext({
    ...pick(['Hash', 'Equal', 'SetDerived'])(Module),
    Free: (ctx, branch) => toStore(ctx).Free(branch),
    GetCanon: (ctx, hash) => toStore(ctx).GetCanon(hash),
    SetCanon: (ctx, hash, branch) => toStore(ctx).SetCanon(hash, branch)
  })

let Tree = () =>  {
  let store = Store()

  let C8izedNeighborhood = pipeCtx([
    Neighborhood.New({Malloc: ({Neighborhood}) => Neighborhood.Malloc()}),
    Canonicalize(Neighborhood, ctx => ctx.Neighborhood)
  ])

  let C8izedEdge = pipeCtx([
    Edge.New({Malloc: ({Edge}) => Edge.Malloc()}),
    Canonicalize(Edge, ctx => ctx.Edge)
  ])

  let MemoizeNext = Next => (...args) => {
    let neighborhood = C8izedNeighborhood(...args)

    if (!neighborhood.next)
      neighborhood.next = Next(...args)

    return neighborhood.next
  }

  let MemoizedLeaf = (() => {
    let C8ize = fn => pipeCtx([fn, Canonicalize(Leaf, ctx => ctx.Leaf)])

    let SetMalloc = fn => fn({Malloc: ctx => ctx.Leaf.Malloc()})

    return {
      ...Leaf,
      ...go(Leaf,
          pick(['Copy', 'FromLiving', 'Set']),
          map(SetMalloc),
          map(C8ize)),
      Next: MemoizeNext(C8ize(SetMalloc(Leaf.Next)))
    }
  })()

  let MemoizedBranch = (() => {
    let B = {
      ...Branch,
      SetDerived: Branch.SetDerived({NewEdge: C8izedEdge})
    }

    let C8ize = fn => pipeCtx([fn, Canonicalize(B, ctx => ctx.Branch)])

    let SetMalloc = fn => fn({Malloc: ctx => ctx.Branch.Malloc()})

    let {Next} = B

    let lift = after => fn => before => after(before(fn))
    
    return {
      ...B,
      ...go(B,
          pick(['Copy', 'FromLiving', 'Set']),
          map(lift(pipe([SetMalloc, C8ize])))),
      Next: lift(pipe([SetMalloc, C8ize, MemoizeNext]))(Next)
    }
  })()

  let Fix = (LeafCase, toBranchCase) => {
    let Dispatcher = (ctx, node, ...rest) =>
      node.size === Leaf.SIZE
        ? LeafCase(ctx, node, ...rest)
        : BranchCase(ctx, node, ...rest)
        
    let BranchCase = toBranchCase({Recur: Dispatcher})

    return Dispatcher
  }

  let LiftFix = (LeafCase, toBranchCase) => {
    let Dispatcher = (ctx, node, ...rest) =>
      node.size === Leaf.SIZE
        ? LeafCase(ctx, node, ...rest)
        : BranchCase(ctx, node, ...rest)
        
    let BranchCase = toBranchCase(fn => opts => {debugger; return fn({...opts, Recur: Dispatcher})})

    return Dispatcher
  }

  let FixBranch = ({Leaf, Branch}) => {
    let polymorphicFirstArg =
      ['AddTo', 'Get', 'Equal', 'Living']
        .map(name => [name, Fix(Leaf[name], Branch[name])])

    let liftedPolymorphicFirstArg =
      ['Copy', 'Next', 'Set']
        .map(name => [name, LiftFix(Leaf[name], Branch[name])])

    let FromLiving = (ctx, locations, size) =>
      size === Leaf.SIZE
        ? LeafCase(ctx, locations, size)
        : BranchCase(ctx, locations, size)

    let LeafCase = Leaf.FromLiving
    let BranchCase = Branch.FromLiving(fn => opts => fn({...opts, Recur: FromLiving}))
    
    return {
      Leaf,
      Branch: {
        ...Branch,
        ...Object.fromEntries(polymorphicFirstArg),
        ...Object.fromEntries(liftedPolymorphicFirstArg),
        FromLiving
      }
    }
  }

  return {
    ...FixBranch({Leaf: MemoizedLeaf, Branch: MemoizedBranch}),
    store
  }
}

export default Tree