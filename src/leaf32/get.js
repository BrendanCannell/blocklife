import CheckBounds from "./check-bounds"
import PrimitiveGet from "./primitive-get"

export default function LeafGet(leaf, [x, y]) {
  CheckBounds(x, y)
  return PrimitiveGet(leaf, x, y)
}