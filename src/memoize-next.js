import CanonicalNeighborhoodConstructor from "./neighborhood/canonical-constructor"
import NN from "./neighborhood/new"

let MemoizeNext = ({LEAF_SIZE, Allocate, LeafGetEdge, LeafGetCorner, BranchGetEdge, BranchGetCorner, NodeGetHash, EdgeGetHash}) => function MemoizeNext(Next) {
  let CNC = CanonicalNeighborhoodConstructor({LEAF_SIZE, Next, NodeGetHash, EdgeGetHash})
    , NewNeighborhood = CNC(NN({Allocate, LEAF_SIZE, LeafGetEdge, LeafGetCorner, BranchGetEdge, BranchGetCorner}))
  
  return function MemoizedNext(...args) {
    return NewNeighborhood(...args).next
  }
}
export default MemoizeNext