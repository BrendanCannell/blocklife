import Mask from "./location-mask"

export function PrimitiveGet(leaf, x, y) {
  return (leaf & Mask(x, y)) !== 0
}