import CheckBounds from "./check-bounds"
import PrimitiveGet from "./primitive-get"

export default () =>
  function LeafGet(_size, leaf, [x, y]) {
    CheckBounds(x, y)
    return PrimitiveGet(leaf, x, y)
  }