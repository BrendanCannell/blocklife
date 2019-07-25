import * as S from "./store"
import * as Leaf from "./leaf"
import * as Branch from "./branch"
import * as Neighborhood from "./neighborhood"
import * as Edge from "./edge"
import * as C from "./canonicalize"
import {pick, map, go, pipe} from "./util/data"

let log = x => console.log(x) || x

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

let Canonicalize = (Node, store) =>
  C.Canonicalize({
    ...pick(['Hash', 'Equal', 'SetDerived'])(Node),
    ...store
  })

let Tree = () =>  {
  let store = Store()

  let C8izedNeighborhood = Canonicalize(Neighborhood, store.Neighborhood)(Neighborhood.New)

  let C8izedEdge = Canonicalize(Edge, store.Edge)(Edge.New)

  let MemoizeNext = Next => (...args) => {
    let neighborhood = C8izedNeighborhood(...args)

    if (!neighborhood.next)
      neighborhood.next = Next(...args)

    return neighborhood.next
  }

  let MemoizedLeaf = (() => {
    let C8ize = Canonicalize(Leaf, store.Leaf)
    
    return {
      ...Leaf,
      ...go(Leaf,
          pick(['Copy', 'FromLiving', 'Set']),
          map(C8ize)),
      Next: MemoizeNext(C8ize(Leaf.Next))
    }
  })()

  let MemoizedBranch = (() => {
    let B = {
      ...Branch,
      SetDerived: Branch.SetDerived({NewEdge: C8izedEdge})
    }
    let {Next} = B
    let C8ize = Canonicalize(B, store.Branch)

    let lift = now => fn => (...later) => now(fn(...later))
    
    return {
      ...B,
      ...go(B,
          pick(['Copy', 'FromLiving', 'Set']),
          map(lift(C8ize))),
      Next: lift(pipe([C8ize, MemoizeNext]))(Next)
    }
  })()

  let Fix = (LeafCase, toBranchCase) => {
    let Dispatcher = (node, ...rest) =>
      node.size === Leaf.SIZE
        ? LeafCase(node, ...rest)
        : BranchCase(node, ...rest)
        
    let BranchCase = toBranchCase({Recur: Dispatcher})

    return Dispatcher
  }

  let FixBranch = ({Leaf, Branch}) => {
    let polymorphicFirstArg =
      ['AddTo', 'Copy', 'Equal', 'Get', 'Living', 'Next', 'Set']
        .map(name => [name, Fix(Leaf[name], Branch[name])])

    let FromLiving = (locations, size) =>
      size === Leaf.SIZE
        ? LeafCase(locations, size)
        : BranchCase(locations, size)

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

  return {
    ...FixBranch({Leaf: MemoizedLeaf, Branch: MemoizedBranch}),
    store
  }
}

export default Tree