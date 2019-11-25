import {SIZE} from "./constants"
import Mutate from "./mutate"

export default ({Allocate}) =>
  function LeafFromLiving(locations) {
    let raw = Allocate()
    for (let i = 0; i < SIZE; i++)
      raw[i] = 0
    for (let loc of locations)
      Mutate(raw, loc, true)
    return raw
  }