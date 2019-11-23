import MemoizeCopy from "../memoize-copy"
import Edge from "../edge"
import ToCanonicalizeConstructor from "../edge/canonical-constructor"
import {
  Allocate as AllocateCtx,
  CopyMemoTable as CopyMemoTableCtx
} from "../context"

let AllocateCtxEdge = AllocateCtx.Edge
let AllocateEdge = (...args) => AllocateCtxEdge()(...args)

let CanonicalizeEdgeConstructor = ToCanonicalizeConstructor()
let MemoizedEdgeCopy =
  MemoizeCopy({MemoTable: CopyMemoTableCtx})(
    CanonicalizeEdgeConstructor(
      Edge.Copy({
        Allocate: AllocateEdge,
        Recur: edge => MemoizedEdgeCopy(edge)
      })
    )
  )
let Copy = MemoizedEdgeCopy
let New = CanonicalizeEdgeConstructor(Edge.New({Allocate: AllocateEdge}))

export default {...Edge, CanonicalizeConstructor: CanonicalizeEdgeConstructor, Copy, New}