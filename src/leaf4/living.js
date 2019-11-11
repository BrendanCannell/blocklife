import PrimitiveGet from "./primitive-get"
import {SIZE} from "./constants"

export default function* Living(leaf) {
  for (let y = 0; y < SIZE; y++)
    for (let x = 0; x < SIZE; x++)
      if (PrimitiveGet(leaf, x, y))
        yield [x, y]
}