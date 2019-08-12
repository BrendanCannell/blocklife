export const SIZE = 32
export const WEST_EDGE = 0x80000000
export const EAST_EDGE = 0x00000001

export let CheckBounds = (x, y) => {
  let err = explanation => {throw TypeError(`Out of bounds: ${explanation} in ${[x, y]}`)}
  if (x < 0) err("x < 0")
  if (y < 0) err("y < 0")
  if (x >= SIZE) err("x >= " + SIZE)
  if (y >= SIZE) err("y >= " + SIZE)
}

export let _Get = (leaf, x, y) => {
  let row = leaf[y]
    , mask = WEST_EDGE >>> x
  return (row & mask) !== 0
}

export let Mutate = (leaf, [x, y], state) => {
  CheckBounds(x, y)
  let row = leaf[y]
    , mask = WEST_EDGE >>> x
  leaf[y] = state ?
      row | mask
    : row & ~mask
  return leaf
}