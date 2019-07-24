import * as H from "./hash"
import * as D from "./direction"
import * as E from "./edge"

export let Malloc = () => {
  let branch = [null, null, null, null]

  branch.size = 0
  branch.hash = 0
  branch.edges = [null, null, null, null]
  branch.corners = [0, 0, 0, 0]
}

const QUADRANTS = [
  {index: 0, offset: [0,   0]},
  {index: 1, offset: [0.5, 0]},
  {index: 2, offset: [0,   0.5]},
  {index: 3, offset: [0.5, 0.5]}
]

let InBounds = (x, size) => 0 <= x && x < size

let Quadrant = ([x, y], size) => {
  for (let Q of QUADRANTS) {
    let [dx, dy] = Q.offset

    if (InBounds(x - dx * size, size / 2) && InBounds(y - dy * size, size / 2))
      return Q
  }

  throw TypeError(`Out of bounds: location = ${[x, y]}, size = ${size}`)
}

let QuadrantLocation = (location, size) => {
  let {index, offset: [dx, dy]} = Quadrant(location, size)
  let [x, y] = location

  return {index, location: [x - dx * size, y - dy * size]}
}

export let Hash = H.ofHashedArray

export let SetDerived = (branch, hash = Hash(branch)) => {
  branch.hash = hash

  for (let i = 0; i < 4; i++) {
    branch.edges[i] = Edge(i, branch)
    branch.corners[i] = branch[i].corners[i]
  }

  return branch
}

export let AddTo = ({Recur}) =>
  (branch, opts, x, y) => {
    let {size} = branch

    for (let {index, offset: [dx, dy]} of QUADRANTS)
      Recur(branch[index], opts, x + dx * size, y + dy * size)
  }

export let Copy = ({Recur}) =>
  (raw, branch) => {
    raw.size = branch.size

    for (let i = 0; i < 4; i++)
      raw[i] = Recur(branch[i])
    
    return raw
  }

export let Equal = ({Recur}) =>
  (a, b) => D.QUADRANTS.every(i => Recur(a[i], b[i]))

export let FromLiving = ({Recur}) =>
  (raw, locations, size) => {
    raw.size = size

    // From live locations
    let partitions = [[], [], [], []]
      
    for (let loc of locations) {
      let {index, location} = QuadrantLocation(loc, size)

      partitions[index].push(location)
    }

    for (let i = 0; i < 4; i++)
      raw[i] = Recur(partitions[i], size / 2)

    return raw
  }

export let Get = ({Recur}) =>
  (branch, loc) => {
    let {index, location} = QuadrantLocation(loc, branch.size)

    return Recur(branch[index], location)
  }

export let Living = ({Recur}) =>
  function*(branch) {
    let {size} = branch

    for (let {index, offset: [dx, dy]} of QUADRANTS)
      for (let [x, y] of Recur(branch[index]))
        yield [x + dx * size, y + dy * size]
  }

export let Next = ({Recur, Neighborhood}) => (
    raw = Malloc(),
    {
      node: branch,
      edges: [N, S, W, E],
      corners: [NW, NE, SW, SE]
    }
  ) => {
    let B = branch

    raw.size = B.size

    let
      sg0 = NW[D.SE],
      sg1 = N [D.SW],
      sg2 = N [D.SE],
      sg3 = NE[D.SW],
  
      sg4 = W [D.NE],
      sg5 = B [D.NW],
      sg6 = B [D.NE],
      sg7 = E [D.NW],
  
      sg8 = W [D.SE],
      sg9 = B [D.SW],
      sgA = B [D.SE],
      sgB = E [D.SW],
  
      sgC = SW[D.NE],
      sgD = S [D.NW],
      sgE = S [D.NE],
      sgF = SE[D.NW]
    
    raw[D.NW] = Recur(Neighborhood(sg5, sg1, sg9, sg4, sg6, sg0, sg2, sg8, sgA))
    raw[D.NE] = Recur(Neighborhood(sg6, sg2, sgA, sg5, sg7, sg1, sg3, sg9, sgB))
    raw[D.SW] = Recur(Neighborhood(sg9, sg5, sgD, sg8, sgA, sg4, sg6, sgC, sgE))
    raw[D.SE] = Recur(Neighborhood(sgA, sg6, sgE, sg9, sgB, sg5, sg7, sgD, sgF))

    return raw
  }

export let Set = ({Recur}) =>
  (raw, branch, pairs) => {
    let {size} = branch

    raw.size = size

    let partitions = [[], [], [], []]
  
    for (let [loc, state] of pairs) {
      let {index, location} = QuadrantLocation(loc, size)

      partitions[index].push([location, state])
    }

    for (let i = 0; i < 4; i++)
      raw[i] =
        partitions[i].length === 0
          ? branch[i]
          : Recur(branch[i], partitions[i])

    return raw
  }