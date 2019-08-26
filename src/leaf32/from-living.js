import {SIZE} from "./constants"
import Mutate from "./mutate"

export default ({Malloc}) =>
  function LeafFromLiving(_, locations) {
    let raw = Malloc()
    for (let i = 0; i < SIZE; i++)
      raw[i] = 0
    for (let loc of locations)
      Mutate(raw, loc, true)
    return raw
  }