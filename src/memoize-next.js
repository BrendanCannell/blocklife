import {Neighborhood} from "./canonicalize/new"

let MemoizeNext = Next =>
  function MemoizedNext(...args) {
    let neighborhood = Neighborhood(...args)
    if (!neighborhood.next)
      neighborhood.next = Next(...args)
    return neighborhood.next
  }

export default MemoizeNext