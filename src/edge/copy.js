import {HASH} from "./constants"

export default ({Allocate, Recur: Copy}) =>
  function EdgeCopy(edge) {
    let raw = Allocate()
      , hasLeafChildren = typeof edge[0] === 'number'
    if (hasLeafChildren) {
      raw[0] = edge[0]
      raw[1] = edge[1]
    } else {
      raw[0] = Copy(edge[0])
      raw[1] = Copy(edge[1])
    }
    raw[HASH] = edge[HASH]
    return raw
  }