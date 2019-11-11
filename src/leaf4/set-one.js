import Mask from "./location-mask"

export default function SetOne(leaf, [x, y], state) {
  let mask = Mask(x, y)

  return state
    ? leaf | mask
    : leaf & ~mask
}