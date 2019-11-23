import CanonicalNeighborhoodConstructor from "./neighborhood/canonical-constructor"
import NN from "./neighborhood/new"

let MemoizeNext = ({Allocate, Branch, Edge, Leaf}) => function MemoizeNext(Next) {
  let CNC = CanonicalNeighborhoodConstructor({Branch, Edge, Leaf, Next})
    , NewNeighborhood = CNC(NN({Allocate, Branch, Edge, Leaf}))
  
  return function MemoizedNext(...args) {
    return NewNeighborhood(...args).next
  }
}
export default MemoizeNext