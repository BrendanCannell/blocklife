import {reducer, finalize} from "./hash"

const SIZE = 32
const WEST_EDGE = 0x80000000
const EAST_EDGE = 0x00000001

let checkBounds = (x, y) => {
  let err = explanation => {throw TypeError(`Out of bounds: ${explanation} in ${[x, y]}`)}

  if (x < 0) err("x < 0")
  if (y < 0) err("y < 0")
  if (x >= SIZE) err("x >= " + SIZE)
  if (y >= SIZE) err("y >= " + SIZE)
}

// Number of set bits in a U32. See "Hacker's Delight" chapter 5
let population = x => {
  x = (x & 0x55555555) + (x >>> 1  & 0x55555555)
  x = (x & 0x33333333) + (x >>> 2  & 0x33333333)
  x = (x & 0x0F0F0F0F) + (x >>> 4  & 0x0F0F0F0F)
  x = (x & 0x00FF00FF) + (x >>> 8  & 0x00FF00FF)
  x = (x & 0x0000FFFF) + (x >>> 16 & 0x0000FFFF)

  return x | 0
}

function Block({rows} = {}) {
  if (!new.target) return new Block(...arguments)

  this.rows = new Int32Array(rows || SIZE + 1)

  // Derived data:
  this.edge = {
    north: 0,
    south: 0,
    west: 0,
    east: 0
  }
  this.population = 0
  this.hash = 0

  if (rows) this.sync()

  return this
}

Block.SIZE = SIZE
Block.prototype.size = SIZE

Block.prototype.draw = function(drawOptions, ix0, iy0, ix1, iy1) {
  let {imageBuffer, imageWidth, imageHeight, frameFraction, scale} = drawOptions

  let dxMin = Math.max(ix0, 0) - ix0 | 0
  let dxMax = Math.min(ix1, imageWidth) - ix0 | 0

  let dyMin = Math.max(iy0, 0) - iy0 | 0
  let dyMax = Math.min(iy1, imageHeight) - iy0 | 0

  for (let dy = dyMin; dy < dyMax; dy++) {
    let row = this.rows[dy * scale | 0]
    let base = imageWidth * (dy + iy0 | 0) + ix0 | 0

    for (let dx = dxMin; dx < dxMax; dx++) {
      let cell = row << (dx * scale) & 0x80000000

      if (cell !== 0) imageBuffer[base + dx] += frameFraction
    }
  }
}

Block.prototype.addTo = function({data, Offset, divisions, mask}, x, y) {
  divisions = divisions | 0; mask = mask | 0;

  let base = Offset(x, y) | 0
  
  for (let y = 0; y < SIZE; y++) {
    let offset = base + y * divisions

    for (let d = 0; d < divisions; d++) {
      data[offset + d] += this.rows[y] >>> d & mask
    }
  }

  return this
} 

Block.prototype.forEach = function(f) {
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      let mask = WEST_EDGE >>> x
      let row = this.rows[y]
      let state = (row & mask) !== 0

      f(state, pair, this)
    }
  }
}

Block.prototype.get = function([x, y], [dx, dy] = [0, 0]) {
  let [bx, by] = [x - dx, y - dy]

  checkBounds(bx, by)

  return this._get(bx, by)
}

Block.prototype._get = function(x, y) {
  let row = this.rows[y]
  let mask = WEST_EDGE >>> x

  return (row & mask) !== 0
} 

Block.prototype.set = function([x, y], state, [dx, dy] = [0, 0]) {
  let [bx, by] = [x - dx, y - dy]

  checkBounds(bx, by)

  let row = this.rows[by]
  let bit = WEST_EDGE >>> bx

  this.rows[by] = state ?
      row | bit
    : row & ~bit

  return this
}

Block.prototype.locations = function*([dx, dy] = [0, 0]) {
  for (let y = 0; y < SIZE; y++)
    for (let x = 0; x < SIZE; x++)
      yield [x + dx, y + dy]
}

Block.prototype.keys = Block.prototype.locations

Block.prototype.alive = function*([dx, dy] = [0, 0]) {
  for (let y = 0; y < SIZE; y++)
    for (let x = 0; x < SIZE; x++)
      if (this._get(x, y) === true)
        yield [x + dx, y + dy]
}

Block.prototype.cells = function*(offset) {
  for (let l of this.locations(offset))
    yield {location: l, state: this._get(l[0], l[1])}
}

Block.prototype.entries = function*(offset) {
  for (let l of this.locations(offset))
    yield [l, this._get(l[0], l[1])]
}

Block.prototype.next = function(opts = {}, north, south, west, east, northwest, northeast, southwest, southeast) {
  // Set up row data for the row above the block

  let cellsN = north.edge.south

  let westNeighborsN = cellsN >>> 1 | northwest.edge.east << SIZE - 1
  let eastNeighborsN = cellsN <<  1 | northeast.edge.west & EAST_EDGE

  let rowNeighborsN_0 = westNeighborsN ^ eastNeighborsN
  let rowNeighborsN_1 = westNeighborsN & eastNeighborsN

  var rowCliquesN_0 = cellsN ^ rowNeighborsN_0
  var rowCliquesN_1 = (cellsN & rowNeighborsN_0) | rowNeighborsN_1

  // Set up row data for the first row

  var cells = this.rows[0]

  var westNeighbors = cells >>> 1 | west.edge.east & WEST_EDGE
  var eastNeighbors = cells <<  1 | east.edge.west >>> SIZE - 1

  var rowNeighbors_0 = westNeighbors ^ eastNeighbors
  var rowNeighbors_1 = westNeighbors & eastNeighbors

  var rowCliques_0 = cells ^ rowNeighbors_0
  var rowCliques_1 = (cells & rowNeighbors_0) | rowNeighbors_1

  // Put the row south of the block in the extra spot at the end of the array

  this.rows[SIZE] = south.edge.north

  // The adjacent columns for the row *south* of the current index

  var westEdgeS = west.edge.east << 1 | southwest.edge.east >>> SIZE - 1
  var eastEdgeS = east.edge.west << 1 | southeast.edge.west >>> SIZE - 1

  for (let y = 0; y < SIZE; y++) {
    let cellsBelow = this.rows[y+1]

    let westNeighborsS = cellsBelow >>> 1 | westEdgeS & WEST_EDGE
    let eastNeighborsS = cellsBelow <<  1 | eastEdgeS >>> 31

    let rowNeighborsS_0 = westNeighborsS ^ eastNeighborsS
    let rowNeighborsS_1 = westNeighborsS & eastNeighborsS

    let rowCliquesS_0 = cellsBelow ^ rowNeighborsS_0
    let rowCliquesS_1 = (cellsBelow & rowNeighborsS_0) | rowNeighborsS_1

    // Compute next iteration of the current row

    // INLINED: let next = Next(...)

    // INLINED: let [b0, c0] = add3(rowNeighbors_0, rowCliquesAbove_0, rowCliquesBelow_0)
    let xor0 = rowCliquesN_0 ^ rowCliquesS_0
    let and0 = rowCliquesN_0 & rowCliquesS_0
    let b0 = rowNeighbors_0 ^ xor0
    let c0 = (rowNeighbors_0 & xor0) | and0

    // INLINED: let [b1, c1] = add3(rowNeighbors_1, rowCliquesAbove_1, rowCliquesBelow_1)
    let xor1 = rowCliquesN_1 ^ rowCliquesS_1
    let and1 = rowCliquesN_1 & rowCliquesS_1
    let b1 = rowNeighbors_1 ^ xor1
    let c1 = (rowNeighbors_1 & xor1) | and1
    
    let twoOrThreeNeighbors = (c0 ^ b1) & ~c1
    let next = twoOrThreeNeighbors & (cells | b0)

    // Store the result
    this.rows[y] = next

    // Cache the row data for the next iteration
    rowCliquesN_0 = rowCliques_0
    rowCliquesN_1 = rowCliques_1

    cells = cellsBelow
    rowNeighbors_0 = rowNeighborsS_0
    rowNeighbors_1 = rowNeighborsS_1
    rowCliques_0 = rowCliquesS_0
    rowCliques_1 = rowCliquesS_1

    westEdgeS <<= 1
    eastEdgeS <<= 1
  }

  this.synced = false

  return opts.sync !== false ? this.sync(opts.sync) : this
}

Block.prototype.sync = function({
    hash: doHash = true,
    population: doPopulation = true,
    pruneEmpty = true
  } = {}) {

  // This construction seems to help the optimizer
  doHash       = doHash       ? true : false
  doPopulation = doPopulation ? true : false

  var west = 0
  var east = 0
  var pop = 0
  var hash = SIZE

  for (let i = 0; i < SIZE; i++) {
    let row = this.rows[i]
    
    west |= (row & WEST_EDGE) >>> i
    east |= (row & EAST_EDGE) <<  SIZE - 1 - i

    if (doHash) hash = reducer(hash, row)
    if (doPopulation) pop += population(row)
  }

  if (pop === 0 && pruneEmpty) return empty

  this.edge.north = this.rows[0]
  this.edge.south = this.rows[SIZE - 1]
  this.edge.west  = west
  this.edge.east  = east

  if (doHash) this.hash = finalize(hash)
  if (doPopulation) this.population = pop

  this.synced = true

  return this
}

Block.prototype.draw = function({array, divisions, mask}, offset) {
  mask = mask | 0; offset = offset | 0

  for (let y = 0; y < SIZE; y++) {
    var row = this.rows[y]

    for (let n = 0; n < divisions; n++) {
      array[offset] += row & mask

      row >>>= 1
      offset++
    }
  }
}

let empty = Block()

empty.next = function(_, north, south, west, east) {
  // Fast path for the common case
  if ( !north.edge.south
    && !south.edge.north
    && !west .edge.east
    && !east .edge.west) return empty

  var next = empty
    
  Block.prototype.next.call(empty, ...arguments)

  for (var i = 0; i < 32; i++) if (empty.rows[i] !== 0) { // check
    next = Block(empty) // copy

    for (; i < 32; i++) empty.rows[i] = 0 // reset

    break
  }

  empty.rows[32] = 0

  return next
}

empty.set = function() {
  return Block().set(...arguments)
}

Block.EMPTY = empty

export default Block