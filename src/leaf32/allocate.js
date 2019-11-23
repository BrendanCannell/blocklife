import {SIZE} from "./constants"

export default function LeafAllocate() {
  let leaf = new Int32Array(SIZE + 1)
  leaf.size = SIZE
  leaf.hash = NaN
  leaf.edges = [0, 0, 0, 0]
  leaf.corners = [0, 0, 0, 0]
  leaf.population = NaN
  return leaf
}