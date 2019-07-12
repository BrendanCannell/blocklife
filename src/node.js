import {reducer, finalize} from "./hash"

const QUADRANTS = [
  [0, [0,   0]],
  [1, [0.5, 0]],
  [2, [0,   0.5]],
  [3, [0.5, 0.5]]
]

const NORTHWEST = 0
const NORTHEAST = 1
const SOUTHWEST = 2
const SOUTHEAST = 3

function Node(grid, size, quadrants) {
  if (!new.target) return new Node(...arguments)

  this.grid = grid
  this.size = size

  if (quadrants) {
    this.quadrants = quadrants
  } else {
    let e = grid.getEmpty(size / 2)

    this.quadrants = [e, e, e, e]
  }

  this.population = 0
  this.hash = 0
  this.synced = false

  return this
}

Object.assign(Node, {NORTHWEST, NORTHEAST, SOUTHWEST, SOUTHEAST})

Node.prototype.addTo = function(opts, x, y) {
  let m = this.size / 2

  this.quadrants[NORTHWEST].addTo(opts, x,     y)
  this.quadrants[NORTHEAST].addTo(opts, x + m, y)
  this.quadrants[SOUTHWEST].addTo(opts, x    , y + m)
  this.quadrants[SOUTHEAST].addTo(opts, x + m, y + m)

  return this
}

Node.prototype.alive = function*(offset = [0, 0]) {
  let [dx, dy] = offset

  for (let [qIndex, qOffset] of QUADRANTS) {
    offset[0] = dx + qOffset[0] * this.size
    offset[1] = dy + qOffset[1] * this.size

    for (let location of this.quadrants[qIndex].alive(offset))
      yield location
  }
}

Node.prototype.get = function(location, offset = [0, 0]) {
  let [qIndex, qOffset] = this.getQuadrantLocation(location, offset)[0]

  addQuadrantOffset(offset, qOffset, this.size)

  return this.quadrants[qIndex].get(location, offset)
}

Node.prototype.getQuadrantLocation = function([x, y], [dx, dy] = [0, 0]) {
  let nx = x - dx
  let ny = y - dy
  let s = this.size
  let m = s / 2

  for (let q of QUADRANTS) {
    let [_, [qdx, qdy]] = q
    let [qx0, qy0] = [qdx * s, qdy * s]
    let [qx1, qy1] = [qx0 + m, qy0 + m]

    if (qx0 <= nx && nx < qx1 && qy0 <= ny && ny < qy1)
      return q
  }

  throw TypeError(`Out of bounds: location = ${[x, y]}, offset = ${[dx, dy]}`)
}

let addQuadrantOffset = (offset, qOffset, size) => {
  let [qdx, qdy] = qOffset

  offset[0] += size * qdx
  offset[1] += size * qdy
}

Node.prototype.set = function(location, isAlive, offset = [0, 0]) {
  let [qIndex, qOffset] = this.getQuadrantLocation(location, offset)

  addQuadrantOffset(offset, qOffset, this.size)

  this.quadrants[qIndex] = this.quadrants[qIndex].set(location, isAlive, offset)

  this.synced = false

  return this
}

Node.prototype.draw = function(drawOptions, ix0, iy0, ix1, iy1) {
  if (ix1 < 0 || iy1 < 0 || ix0 >= drawOptions.imageWidth || iy0 >= drawOptions.imageHeight) return

  let isx = (ix0 + ix1) / this.size
  let isy = (iy0 + iy1) / this.size

  for (let [qIndex, [qdx, qdy]] of QUADRANTS) {
    let iqx0 = ix0 + qdx * isx
    let iqy0 = iy0 + qdy * isy
    let iqx1 = iqx0 + isx / 2
    let iqy1 = iqy0 + isy / 2

    this.quadrants[qIndex].draw(drawOptions, iqx0, iqy0, iqx1, iqy1)
  }
}

Node.prototype.next = function(opts = {}, north, south, west, east, northwest, northeast, southwest, southeast) {
  // First we get all the relevant child nodes.
  // There are sixteen:
  // - The four quadrants of `this`
  // - Two from each of the four side neighbors
  // - One from each of the four corner neighbors

  // In the following diagram, the nine blocks are `this` and its neighbors.
  // Relevant children are marked with a hexadecimal digit.
  // Unused children are marked with an 'x'.

  /*
    *  xx  xx  xx
    *  x0  12  3x
    *  
    *  x4  56  7x
    *  x8  9A  Bx
    *  
    *  xC  DE  Fx
    *  xx  xx  xx
    */

  if (!northwest.quadrants)
    console.log(this) || console.log(northwest)

  let
    sg0 = northwest.quadrants[SOUTHEAST],
    sg1 = north.quadrants[SOUTHWEST],
    sg2 = north.quadrants[SOUTHEAST],
    sg3 = northeast.quadrants[SOUTHWEST],

    sg4 = west.quadrants[NORTHEAST],
    sg5 = this.quadrants[NORTHWEST],
    sg6 = this.quadrants[NORTHEAST],
    sg7 = east.quadrants[NORTHWEST],

    sg8 = west.quadrants[SOUTHEAST],
    sg9 = this.quadrants[SOUTHWEST],
    sgA = this.quadrants[SOUTHEAST],
    sgB = east.quadrants[SOUTHWEST],

    sgC = southwest.quadrants[NORTHEAST],
    sgD = south.quadrants[NORTHWEST],
    sgE = south.quadrants[NORTHEAST],
    sgF = southeast.quadrants[NORTHWEST]

  let qs = this.quadrants
  
  qs[NORTHWEST] = qs[NORTHWEST].next(opts, sg1, sg9, sg4, sg6, sg0, sg2, sg8, sgA)
  qs[NORTHEAST] = qs[NORTHEAST].next(opts, sg2, sgA, sg5, sg7, sg1, sg3, sg9, sgB)
  qs[SOUTHWEST] = qs[SOUTHWEST].next(opts, sg5, sgD, sg8, sgA, sg4, sg6, sgC, sgE)
  qs[SOUTHEAST] = qs[SOUTHEAST].next(opts, sg6, sgE, sg9, sgB, sg5, sg7, sgD, sgF)

  return opts.sync !== false ? this.sync(opts.sync) : this
}

Node.prototype.sync = function(opts = {}) {
  let {
    hash: doHash = true,
    population: doPopulation = true,
    pruneEmpty = true
  } = opts
  var pop = 0
  var hash = this.size * this.size / 32

  let qs = this.quadrants
  for (let i in qs) {
      qs[i] = qs[i].sync(opts)
      pop += qs[i].population
      hash = reducer(hash, qs[i].hash)
  }

  if (doPopulation) this.population = pop
  if (doHash) this.hash = finalize(hash)

  return pop === 0 && pruneEmpty && this.canCollapse ?
      empty
    : this
}

// Node.Empty creates a non-mutating empty node of a given size

Node.Empty = function() {
  let e = Node(...arguments)

  e.emptyChild = e.quadrants[0]

  let returnThis = function() { return this }

  e.set = setEmpty
  e.next = nextEmpty
  e.addTo = returnThis
  e.sync = returnThis

  return e
}

let setEmpty = function() {
  let e = this.emptyChild

  let replacement = Node(this.grid, this.size, [e, e, e, e])

  return replacement.set(...arguments)
}

let nextEmpty = function(opts, north, south, west, east, northwest, northeast, southwest, southeast) {
  if (south === this && north === this && west === this && east === this) return this

  Node.prototype.next.call(this, opts, north, south, west, east, northwest, northeast, southwest, southeast)

  let qs = this.quadrants
  let e = this.emptyChild

  if (qs.every(q => q === e)) return this // check
  
  let next = Node(this.grid, this.size, [...qs]) // copy

  // reset
  for (let i in qs) qs[i] = e
  
  return next
}

export default Node