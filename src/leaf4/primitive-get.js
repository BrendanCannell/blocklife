import Mask from "./location-mask"

export default function PrimitiveGet(leaf, x, y) {
  return (leaf & Mask(x, y)) !== 0
}