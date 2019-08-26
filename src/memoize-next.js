import CanonicalNeighborhoodConstructor from "./neighborhood/canonical-constructor"
import NN from "./neighborhood/new"

let MemoizeNext = ({LEAF_SIZE, Malloc}) => function MemoizeNext(Next) {
  let CNC = CanonicalNeighborhoodConstructor({LEAF_SIZE, Next})
    , NewNeighborhood = CNC(NN({Malloc}))
  
  return function MemoizedNext(...args) {
    return NewNeighborhood(...args).next
  }
}
export default MemoizeNext