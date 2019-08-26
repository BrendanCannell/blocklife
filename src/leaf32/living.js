import {SIZE} from "./constants"
import PrimitiveGet from "./primitive-get"

export default () =>
  function*(_size, leaf) {
    for (let y = 0; y < SIZE; y++)
      for (let x = 0; x < SIZE; x++)
        if (PrimitiveGet(leaf, x, y) === true)
          yield [x, y]
  }