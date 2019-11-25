import {SIZE} from "./constants"
import Mutate from "./mutate"

export default ({Allocate}) =>
  function LeafSetMany(leaf, pairs) {
    var newLeaf = Allocate(leaf)
    for (let i = 0; i < SIZE; i++)
      newLeaf[i] = leaf[i]
    for (let [loc, state] of pairs)
      Mutate(newLeaf, loc, state)
    return newLeaf
  }