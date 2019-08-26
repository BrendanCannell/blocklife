import Mask from "./mask"

export function SetOne(leaf, [x, y], state) {
  let mask = Mask(x, y)

  return state
    ? leaf | mask
    : leaf & ~mask
}