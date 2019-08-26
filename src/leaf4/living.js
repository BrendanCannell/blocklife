import PrimitiveGet from "./primitive-get"

function* Living(leaf) {
  for (let y = 0; y < 4; y++)
    for (let x = 0; x < 4; x++)
      if (PrimitiveGet(leaf, x, y))
        yield [x, y]
}