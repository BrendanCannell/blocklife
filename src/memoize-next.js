import CanonicalNeighborhoodConstructor from "./neighborhood/canonical-constructor"
import NN from "./neighborhood/new"

let MemoizeNext = ({LEAF_SIZE, Malloc, LeafGetEdge, LeafGetCorner, BranchGetEdge, BranchGetCorner, NodeGetHash, EdgeGetHash}) => function MemoizeNext(Next) {
  let CNC = CanonicalNeighborhoodConstructor({LEAF_SIZE, Next, NodeGetHash, EdgeGetHash})
    , NewNeighborhood = CNC(NN({Malloc, LEAF_SIZE, LeafGetEdge, LeafGetCorner, BranchGetEdge, BranchGetCorner}))
  
  return function MemoizedNext(...args) {
    return NewNeighborhood(...args).next
  }
}
export default MemoizeNext