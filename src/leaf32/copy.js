import {SIZE} from "./constants"

export default ({Malloc}) =>
  function LeafCopy(leaf) {
    let raw = Malloc()
    for (let i = 0; i < SIZE; i++)
      raw[i] = leaf[i]
    raw.hash = leaf.hash
    CopyDerived(leaf, raw)
    return raw
  }

function CopyDerived(original, copy) {
  copy.population = original.population
  let ce = copy.edges
    , cc = copy.corners
    , oe = original.edges
    , oc = original.corners
  for (let i = 0; i < 4; i++) {
    cc[i] = oc[i]
    ce[i] = oe[i]
  }
}