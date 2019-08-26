import {WEST_EDGE} from "./constants"
import CheckBounds from "./check-bounds"

export default function LeafMutate(leaf, [x, y], state) {
  CheckBounds(x, y)
  let row = leaf[y]
    , mask = WEST_EDGE >>> x
  leaf[y] = state ?
      row | mask
    : row & ~mask
  return leaf
}