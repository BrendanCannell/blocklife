import {SIZE} from "./constants"
import Mutate from "./mutate"

export default ({Allocate}) =>
  function LeafSet(leaf, pairs) {
    let raw = Allocate(leaf)
    for (let i = 0; i < SIZE; i++)
      raw[i] = leaf[i]
    for (let [loc, state] of pairs)
      Mutate(raw, loc, state)
    return raw
  }