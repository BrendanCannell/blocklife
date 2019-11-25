import ToCanonicalizeNeighborhoodConstructor from "./neighborhood/canonical-constructor"
import ToNewNeighborhood from "./neighborhood/new"

let MemoizeNext = ({Allocate, Branch, Edge, Leaf}) => function MemoizeNext(Next) {
  let NewNeighborhood = ToNewNeighborhood({Allocate, Branch, Edge, Leaf})
  let CanonicalizeNeighborhoodConstructor = ToCanonicalizeNeighborhoodConstructor({Branch, Edge, Leaf, Next})
  NewNeighborhood = CanonicalizeNeighborhoodConstructor(NewNeighborhood)
  return function MemoizedNext(...args) {
    return NewNeighborhood(...args).next
  }
}
export default MemoizeNext