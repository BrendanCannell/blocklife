import * as New from "../new"
import C8izeBranch from "./branch"
import C8izeEdge from "./edge"
import C8izeNeighborhood from "./neighborhood"

let CanonicalizedNewEdge = C8izeEdge(New.Edge)
let CanonicalizedNewBranch = C8izeBranch(New.Branch)
let CanonicalizedNewNeighborhood = C8izeNeighborhood(New.Neighborhood)

export {
  CanonicalizedNewEdge as Edge,
  CanonicalizedNewBranch as Branch,
  CanonicalizedNewNeighborhood as Neighborhood
}