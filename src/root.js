import * as LR from "./leafRows"
import * as L from "./leaf"
import * as BQ from "./branchQuadrants"
import * as B from "./branch"

let leafSubcontext = () => ({
  base: S.New(LR_Malloc),
  derived: S.New(L_Malloc),
  memoStore: S.New(MN_Malloc),
  memoTable: new Map()
})

let branchSubcontext = () => ({
  base: S.New(BQ_Malloc),
  derived: S.New(B_Malloc),
  memoStore: S.New(MN_Malloc),
  memoTable: new Map()
})

let ctx = [
  leafSubcontext()
]

let getSubcontext = size => {
  let i = Math.log2(size) - 5

  while (ctx.length <= )
}

let MN = (Node, n) => MemoNext({
  Node,
  Malloc: (ctx) => ctx[n].memoStore.Get(),
  Free: (ctx, memo) => ctx[n].memoStore.Free(memo),
  GetMemo: (ctx, hash) => ctx[n].memoTable.get(hash),
  SetMemo: (ctx, hash, memo) => ctx[n].memoTable.set(hash, memo)
})

let LR = LeafRows({
  Malloc: ctx => ctx[0].base.Get()
})

let L = Leaf({
  LeafRows: LR,
  Malloc: ctx => ctx[0].derived.Get()
})

let BQ64 = BranchQuadrants({
  child: {...L, Next: MN(L, 0)},
  Malloc: ctx => ctx[1].base.Get()
})

let B64 = Branch({
  quadrants: BQ64,
  Malloc: ctx => ctx[1].derived.Get()
})

let BQ128 = BranchQuadrants({
  child: {...B64, Next: MN(B64, 1)},
  Malloc: ctx => ctx[2].base.Get()
})

let B128 = Branch({
  quadrants: BQ128,
  Malloc: ctx => ctx[2].derived.Get()
})

// next(Root(N)) -> Root(N) | Root(2N)

let New = (ctx, from) => {

}

let LocationFromCorner = (root, [x, y]) => {
  let d = root.size / 2
  let inRoot = -d <= x && x < d && -d <= y && y < d

  return inRoot && [x + d, y + d]
}

let LocationFromOrigin = (root, [x, y]) => {
  let d = root.size / 2

  return [x - d, y - d]
}