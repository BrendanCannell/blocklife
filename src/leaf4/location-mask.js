import {SIZE} from "./constants"

export default function Mask(x, y) {
  if (x < 0 || x >= SIZE || y < 0 || y >= SIZE)
    throw Error(`Out of bounds: [${x}, ${y}]`)
  return 1 << 30 - 2*x - 2*SIZE*y
}