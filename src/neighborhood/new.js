export default ({Malloc}) =>
  function NewNeighborhood(
    size,
    node,
    // N,  S,  W,  E,
    // NW, NE, SW, SE
  ) {
    let raw = Malloc()
    raw.size = size
    raw.node = node

    let neighborsOffset = arguments.length - 8
    for (let i = 0, j = neighborsOffset; i < 4; i++, j++) {
      raw.neighbors[i]   = arguments[j]
      raw.neighbors[i+4] = arguments[j+4]
      let oppositeEdge   = (i + 1 & 1) + (i & 2)
        , oppositeCorner = 3 - i
      raw.edges  [i] = arguments[j]  .edges  [oppositeEdge]
      raw.corners[i] = arguments[j+4].corners[oppositeCorner]
    }

    return raw
  }