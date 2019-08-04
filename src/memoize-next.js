import C8ize from "./canonicalize/neighborhood"
import {Neighborhood} from "./new"

let C8ized = C8ize(Neighborhood)

let MemoizeNext = Next => function MemoizedNext(...args) {
  let neighborhood = C8ized(...args)

  if (!neighborhood.next)
    neighborhood.next = Next(...args)

  return neighborhood.next
}

export default MemoizeNext