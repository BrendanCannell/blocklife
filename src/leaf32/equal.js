import {SIZE} from "./constants"

export default function LeafEqual(a, b) {
  for (let i = 0; i < SIZE; i++)
    if (a[i] !== b[i]) return false
  return true
}