import {SIZE} from "./constants"

export default ({Malloc}) =>
  function LeafCopy(_size, leaf) {
    let raw = Malloc()
    for (let i = 0; i < SIZE; i++)
      raw[i] = leaf[i]
    return raw
  }