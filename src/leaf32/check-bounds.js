import {SIZE} from "./constants"

export default function CheckBounds(x, y) {
  if (x < 0) Throw(x, y, "x < 0")
  if (y < 0) Throw(x, y, "y < 0")
  if (x >= SIZE) Throw(x, y, "x >= " + SIZE)
  if (y >= SIZE) Throw(x, y, "y >= " + SIZE)
}

function Throw(x, y, explanation) {
  throw TypeError(`Out of bounds: ${explanation} in ${[x, y]}`)
}