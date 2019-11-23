export default ({Allocate, LEAF_SIZE, LeafGetEdge, LeafGetCorner, BranchGetEdge, BranchGetCorner}) =>
  function NewNeighborhood(
    node,
    // N,  S,  W,  E,
    // NW, NE, SW, SE
  ) {
    let raw = Allocate()
      , size = node.size
      , sg = node.storeGeneration
    raw.size = size
    raw.node = node

    let neighborsOffset = arguments.length - 8
    if (size === LEAF_SIZE)
      for (let i = 0, j = neighborsOffset; i < 4; i++, j++) {
        raw.neighbors[i]   = arguments[j]
        raw.neighbors[i+4] = arguments[j+4]
        let oppositeEdge   = (i + 1 & 1) + (i & 2)
          , oppositeCorner = 3 - i
        raw.edges  [i] = LeafGetEdge  (arguments[j],   oppositeEdge)
        raw.corners[i] = LeafGetCorner(arguments[j+4], oppositeCorner)
      }
    else
      for (let i = 0, j = neighborsOffset; i < 4; i++, j++) {
        raw.neighbors[i]   = arguments[j]
        raw.neighbors[i+4] = arguments[j+4]
        let oppositeEdge   = (i + 1 & 1) + (i & 2)
          , oppositeCorner = 3 - i
        raw.edges  [i] = BranchGetEdge  (arguments[j],   oppositeEdge)
        raw.corners[i] = BranchGetCorner(arguments[j+4], oppositeCorner)
      }
    for (let i = 0; i < 4; i++)
      if ((size >  LEAF_SIZE && sg !== raw.edges[i].storeGeneration)
          || sg !== raw.neighbors[i].storeGeneration
          || sg !== raw.neighbors[i + 4].storeGeneration) {
        console.error("Mixed stores:\n" + JSON.stringify(raw, (key, value) => {
          switch (key) {
            case 'storeGeneration': return value
            case 'node': return value.storeGeneration
            case 'edges': return size > LEAF_SIZE ? value.map(n => n.storeGeneration) : undefined
            case 'neighbors': return value.map(n => n.storeGeneration)
            case 'corners': return undefined
            default: return value
          }
        }, 2))
        throw Error("Mixed stores")
      }
    return raw
  }