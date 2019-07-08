import * as H from "./hash"

const SIZE = 32
const LEFTMOST_BIT = 0x80000000
const RIGHTMOST_BIT = 0x00000001

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

function Block32(buffer) {
  if (!new.target) return new Block32(buffer)

  this.rows = new Int32Array(buffer || SIZE + 1)

  // Derived data:
  this.edge = {
    bottom: 0,
    top: 0,
    left: 0,
    right: 0
  }
  this.population = 0
  this.hash = 0

  this.synced = false
}

Block32.SIZE = SIZE
Block32.prototype.size = SIZE

Block32.prototype.draw = function(drawOptions, ix0, iy0, ix1, iy1) {
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

Block32.prototype.forEach = function(f) {
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      let mask = LEFTMOST_BIT >>> x
      let row = this.rows[y]
      let state = (row & mask) !== 0

      f(state, pair, this)
    }
  }
}

Block32.prototype.get = function([x, y], [dx, dy] = [0, 0]) {
  let [x_, y_] = [x - dx, y - dy]

  checkBounds(x_, y_)

  return this._get(x_, y_)
}

Block32.prototype._get = function(x, y) {
  let row = this.rows[y]
  let mask = LEFTMOST_BIT >>> x

  return (row & mask) !== 0
} 

Block32.prototype.set = function([x, y], state, [dx, dy] = [0, 0]) {
  checkBounds(x - dx, y - dy)

  let row = this.rows[y]
  let bit = LEFTMOST_BIT >>> x

  this.rows[y] = state ?
      row | bit
    : row & ~bit
  
  this.synced = false

  return this
}

Block32.prototype.cells = function() {
  let cells = []

  for (let y = 0; y < SIZE; y++)
    for (let x = 0; x < SIZE; x++)
      cells.push({
        location: [x, y],
        state: 0 !== (this.rows[y] >>> SIZE - 1 - x & 1)
      })
  
  return cells
}

Block32.prototype.locations = function*([dx, dy] = [0, 0]) {
  for (let y = 0; y < SIZE; y++)
    for (let x = 0; x < SIZE; x++)
      yield [x + dx, y + dy]
}

Block32.prototype.keys = Block32.prototype.locations

Block32.prototype.alive = function*([dx, dy] = [0, 0]) {
  for (let y = 0; y < SIZE; y++)
    for (let x = 0; x < SIZE; x++)
      if (this._get(x, y) === true)
        yield [x + dx, y + dy]
}

Block32.prototype.cells = function*(offset) {
  for (let l of this.locations(offset))
    yield {location: l, state: this._get(l[0], l[1])}
}

Block32.prototype.entries = function*(offset) {
  for (let l of this.locations(offset))
    yield [l, this._get(l[0], l[1])]
}

Block32.prototype.next = function(below, above, left, right, belowleft, belowright, aboveleft, aboveright) {
  // Set up row data for the row above the block

  let leftNeighborsAbove  = above.edge.bottom >>> 1 | aboveleft.edge.right << SIZE - 1
  let rightNeighborsAbove = above.edge.bottom <<  1 | (aboveright.edge.left & RIGHTMOST_BIT)

  let rowNeighborsAbove_0 = leftNeighborsAbove ^ rightNeighborsAbove
  let rowNeighborsAbove_1 = leftNeighborsAbove & rightNeighborsAbove

  let rowCliquesAbove_0 = above.edge.bottom ^ rowNeighborsAbove_0
  let rowCliquesAbove_1 = (above.edge.bottom & rowNeighborsAbove_0) | rowNeighborsAbove_1

  // Set up row data for the first row

  let cells = this.rows[0]

  let leftNeighbors =  cells >>> 1 | (left.edge.right & LEFTMOST_BIT)
  let rightNeighbors = cells <<  1 |  right.edge.left >>> SIZE - 1

  let rowNeighbors_0 = leftNeighbors ^ rightNeighbors
  let rowNeighbors_1 = leftNeighbors & rightNeighbors

  let rowCliques_0 = cells ^ rowNeighbors_0
  let rowCliques_1 = (cells & rowNeighbors_0) | rowNeighbors_1

  // Put the row below the block in the extra spot at the end of the array

  this.rows[SIZE] = below.edge.top

  // The adjacent columns for the row *below* the current index

  let leftBelow  = left.edge.right << 1 | belowleft.edge.right >>> SIZE - 1
  let rightBelow = right.edge.left << 1 | belowright.edge.left >>> SIZE - 1

  for (let y = 0; y < SIZE; y++) {
    let cellsBelow = this.rows[y+1]

    let leftNeighborsBelow  = cellsBelow >>> 1 | (leftBelow  <<  y      & 0x80000000)
    let rightNeighborsBelow = cellsBelow <<  1 | (rightBelow >>> SIZE - 1 - y & 0x00000001)

    let rowNeighborsBelow_0 = leftNeighborsBelow ^ rightNeighborsBelow
    let rowNeighborsBelow_1 = leftNeighborsBelow & rightNeighborsBelow

    let rowCliquesBelow_0 =  cellsBelow ^ rowNeighborsBelow_0
    let rowCliquesBelow_1 = (cellsBelow & rowNeighborsBelow_0) | rowNeighborsBelow_1

    // Compute next iteration of the current row

    // INLINED: let next = Next(...)

    // INLINED: let [b0, c0] = add3(rowNeighbors_0, rowCliquesAbove_0, rowCliquesBelow_0)
    let xor0 = rowCliquesAbove_0 ^ rowCliquesBelow_0
    let and0 = rowCliquesAbove_0 & rowCliquesBelow_0
    let b0 = rowNeighbors_0 ^ xor0
    let c0 = (rowNeighbors_0 & xor0) | and0

    // INLINED: let [b1, c1] = add3(rowNeighbors_1, rowCliquesAbove_1, rowCliquesBelow_1)
    let xor1 = rowCliquesAbove_1 ^ rowCliquesBelow_1
    let and1 = rowCliquesAbove_1 & rowCliquesBelow_1
    let b1 = rowNeighbors_1 ^ xor1
    let c1 = (rowNeighbors_1 & xor1) | and1
    
    let twoOrThreeNeighbors = (c0 ^ b1) & ~c1
    let next = twoOrThreeNeighbors & (cells | b0)

    // Store the result
    this.rows[y] = next

    // Cache the row data for the next iteration
    rowCliquesAbove_0 = rowCliques_0
    rowCliquesAbove_1 = rowCliques_1

    cells = cellsBelow
    rowNeighbors_0 = rowNeighborsBelow_0
    rowNeighbors_1 = rowNeighborsBelow_1
    rowCliques_0 = rowCliquesBelow_0
    rowCliques_1 = rowCliquesBelow_1
  }

  this.synced = false

  return {value: this, done: false}
}

Block32.prototype.sync = function(options) {
  var left = 0
  var right = 0
  var pop = 0
  var hash = SIZE

  // This construction seems to help the optimizer, more than `!!` or `Boolean()`
  let doHash       = options && options.hash       ? true : false
  let doPopulation = options && options.population ? true : false

  for (let i = 0; i < SIZE; i++) {
    let row = this.rows[i]
    
    left  |= (row & LEFTMOST_BIT)  >>> i
    right |= (row & RIGHTMOST_BIT) <<  SIZE - 1 - i

    if (doHash) hash = H.reducer(hash, row)
    if (doPopulation) pop += population(row)
  }

  if (pop === 0 && options && options.pruneEmpty) return empty

  this.edge.bottom = this.rows[SIZE - 1]
  this.edge.top    = this.rows[0]
  this.edge.left   = left
  this.edge.right  = right

  if (doHash) this.hash = H.finalize(hash)
  if (doPopulation) this.population = pop

  this.synced = true

  return this
}

Block32.prototype.draw = function({array, divisions, mask}, offset) {
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

let empty = new Block32()

empty.next = function(below, above, left, right, belowleft, belowright, aboveleft, aboveright) {
  if (!left.edge.right && !right.edge.left && !above.edge.bottom && !below.edge.top) return empty

  var next = empty
    
  Block32.prototype.next.call(empty, below, above, left, right, belowleft, belowright, aboveleft, aboveright)

  for (var i = 0; i < 32; i++) if (empty.rows[i] !== 0) { // check
    next = new Block32(empty.rows) // copy

    for (; i < 32; i++) empty.rows[i] = 0 // reset

    break
  }

  return next
}

empty.set = function() {
  return new Block32().set(...arguments)
}

Block32.EMPTY = empty

export default Block32