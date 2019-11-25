import MemoizeWithTable from "../memoize-with-table"
import WithClearedMemoTable from "../with-cleared-memo-table"
import Edge from "../edge"
import ToCanonicalizeConstructor from "../edge/canonical-constructor"
import {Allocate as AllocateCtx} from "../context"

let AllocateCtxEdge = AllocateCtx.Edge
let AllocateBranch = (...args) => AllocateCtxEdge()(...args)

let CanonicalizeEdgeConstructor = ToCanonicalizeConstructor()
let New = CanonicalizeEdgeConstructor(Edge.New({Allocate: AllocateBranch}))
let memoTable = new Map()
let MemoizedCopy =
  MemoizeWithTable(memoTable)(
    CanonicalizeEdgeConstructor(
      Edge.Copy({Allocate: AllocateBranch, Recur: edge => Copy(edge)})))
let Copy = WithClearedMemoTable(memoTable)(MemoizedCopy)

export default {...Edge, CanonicalizeConstructor: CanonicalizeEdgeConstructor, Copy, New}