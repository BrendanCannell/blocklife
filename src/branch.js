import * as H from "./hash"

export let Malloc = () => ({
  quadrants: [null, null, null, null],
  north: 0,
  south: 0,
  west: 0,
  east: 0,
  northwest: 0,
  northeast: 0,
  southwest: 0,
  southeast: 0,
  hash: 0,
  size: 0,
  population: 0
})

const [NW, NE, SW, SE] = [0, 1, 2, 3]

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

let UpdateDerived = branch => {
  let [NW, NE, SW, SE] = branch.quadrants
  
  branch.north = H.of(NW.north, NE.north)
  branch.south = H.of(SW.south, SE.south)
  branch.west  = H.of(NW.west,  SW.west)
  branch.east  = H.of(NE.east,  SE.east)
  branch.northwest = NW.northwest
  branch.northeast = NE.northeast
  branch.southwest = SW.southwest
  branch.southeast = SE.southeast

  branch.hash = H.of(NW.hash, NE.hash, SW.hash, SE.hash)
  branch.population = branch.quadrants.reduce((a, b) => a + b.population, 0)

  return branch
}

export let AddTo = ({Recur}) =>
  ({quadrants, size}, opts, x, y) => {
    for (let {index, offset: [dx, dy]} of QUADRANTS)
      Recur(quadrants[index], opts, x + dx * size, y + dy * size)
  }

export let Copy = ({Recur, Malloc: M = Malloc}) =>
  (branch) => {
    let raw = M()
    raw.size = branch.size

    for (let i = 0; i < 4; i++)
      raw.quadrants[i] = Recur(branch.quadrants[i])
    
    return UpdateDerived(raw)
  }

export let Equal = ({Recur}) =>
  ({quadrants: a}, {quadrants: b}) => {
    if (a === b) return true

    for (let i = 0; i < 4; i++)
      if (!Recur(a[i], b[i])) return false
    
    return true
  }

export let FromLiving = ({Recur, Malloc: M = Malloc}) =>
  (locations, size) => {
    let raw = M()
    raw.size = size

    // From live locations
    let partitions = [[], [], [], []]
      
    for (let loc of locations) {
      let {index, location} = QuadrantLocation(loc, size)

      partitions[index].push(location)
    }

    for (let i = 0; i < 4; i++)
      raw.quadrants[i] = Recur(partitions[i], size / 2)

    return UpdateDerived(raw)
  }

export let Get = ({Recur}) =>
  ({quadrants, size}, loc) => {
    let {index, location} = QuadrantLocation(loc, size)

    return Recur(quadrants[index], location)
  }

export let Living = ({Recur}) =>
  function*({quadrants, size}) {
    for (let {index, offset: [dx, dy]} of QUADRANTS)
      for (let [x, y] of Recur(quadrants[index]))
        yield [x + dx * size, y + dy * size]
  }

export let Next = ({Recur, Malloc: M = Malloc}) =>
  (branch, north, south, west, east, northwest, northeast, southwest, southeast) => {
    let raw = M()
    raw.size = branch.size

    const q = 'quadrants'

    let
      sg0 = northwest[q][SE],
      sg1 = north    [q][SW],
      sg2 = north    [q][SE],
      sg3 = northeast[q][SW],
  
      sg4 = west     [q][NE],
      sg5 = branch   [q][NW],
      sg6 = branch   [q][NE],
      sg7 = east     [q][NW],
  
      sg8 = west     [q][SE],
      sg9 = branch   [q][SW],
      sgA = branch   [q][SE],
      sgB = east     [q][SW],
  
      sgC = southwest[q][NE],
      sgD = south    [q][NW],
      sgE = south    [q][NE],
      sgF = southeast[q][NW]
    
    raw[q][NW] = Recur(sg5, sg1, sg9, sg4, sg6, sg0, sg2, sg8, sgA)
    raw[q][NE] = Recur(sg6, sg2, sgA, sg5, sg7, sg1, sg3, sg9, sgB)
    raw[q][SW] = Recur(sg9, sg5, sgD, sg8, sgA, sg4, sg6, sgC, sgE)
    raw[q][SE] = Recur(sgA, sg6, sgE, sg9, sgB, sg5, sg7, sgD, sgF)
    
    return UpdateDerived(raw)
  }

export let Set = ({Recur, Malloc: M = Malloc}) =>
  ({quadrants, size}, pairs) => {
    let raw = M()
    raw.size = size

    let partitions = [[], [], [], []]
  
    for (let [loc, state] of pairs) {
      let {index, location} = QuadrantLocation(loc, size)

      partitions[index].push([location, state])
    }

    for (let i = 0; i < 4; i++)
      raw.quadrants[i] =
        partitions[i].length === 0
          ? quadrants[i]
          : Recur(quadrants[i], partitions[i])

    return UpdateDerived(raw)
  }