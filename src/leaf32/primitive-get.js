import {WEST_EDGE} from "./constants"

export default function PrimitiveLeafGet(leaf, x, y) {
  let row = leaf[y]
    , mask = WEST_EDGE >>> x
  return (row & mask) !== 0
}