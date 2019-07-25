import * as H from "./hash"
import * as D from "./direction"

export const SIZE = 32

export let Malloc = () => {
  let leaf = new Int32Array(SIZE + 1)

  leaf.size = SIZE
  leaf.hash = 0
  leaf.edges = [0, 0, 0, 0]
  leaf.corners = [0, 0, 0, 0]

  return leaf
}

export let Hash = H.ofArray

export let SetDerived = (leaf, hash = Hash(leaf)) => {
  leaf.hash = hash

  var west = 0
  var east = 0
  var population = 0

  for (let i = 0; i < SIZE; i++) {
    let row = leaf[i]
    
    west |= (row & WEST_EDGE) >>> i
    east |= (row & EAST_EDGE) <<  31 - i

    population += Population(row)
  }

  leaf.edges[D.N] = leaf[0]
  leaf.edges[D.S] = leaf[31]
  leaf.edges[D.W] = west
  leaf.edges[D.E] = east
  
  leaf.corners[D.NW] = west >>> 31
  leaf.corners[D.NE] = east >>> 31
  leaf.corners[D.SW] = west & 1
  leaf.corners[D.SE] = east & 1

  leaf.population = population

  return leaf
}
  
export let AddTo = (leaf, {data, Offset, divisions, mask}, x, y) => {
  divisions = divisions | 0; mask = mask | 0;

  let base = Offset(x, y) | 0
  
  for (let y = 0; y < SIZE; y++) {
    let offset = base + y * divisions

    for (let d = 0; d < divisions; d++) {
      data[offset + d] += leaf[y] >>> d & mask
    }
  }

  return data
}

export let Get = (leaf, [x, y]) => {
  CheckBounds(x, y)

  return _Get(leaf, x, y)
}

export let Living = function*(leaf) {
  for (let y = 0; y < SIZE; y++)
    for (let x = 0; x < SIZE; x++)
      if (_Get(leaf, x, y) === true)
        yield [x, y]
}

export let Equal = (a, b) => {
  for (let i = 0; i < SIZE; i++)
    if (a[i] !== b[i]) return false
  
  return true
}

export let Copy = (raw, leaf) => {
  for (let i = 0; i < SIZE; i++)
    raw[i] = leaf[i]
  
  return raw
}

export let FromLiving = (raw, locations) => {
  for (let i = 0; i < SIZE; i++)
    raw[i] = 0

  for (let loc of locations)
    Mutate(raw, loc, true)

  return raw
}

export let Set = (raw, leaf, pairs) => {
  for (let i = 0; i < SIZE; i++)
    raw[i] = leaf[i]
  
  for (let [loc, state] of pairs)
    Mutate(raw, loc, state)

  return raw
}

export let Next = (
  raw = Malloc(),
  leaf,
  north, south, west, east,
  northwest, northeast, southwest, southeast
) => {

// Set up row data for the row just north of the block (`north.south`)...

let rowN = north.edges[D.S]
let westSiblingN = rowN >>> 1 | northwest.corners[D.SE] << SIZE - 1
let eastSiblingN = rowN <<  1 | northeast.corners[D.SW]

let siblingCountN_0 = westSiblingN ^ eastSiblingN
let siblingCountN_1 = westSiblingN & eastSiblingN

var familyCountN_0 = rowN ^ siblingCountN_0
var familyCountN_1 = (rowN & siblingCountN_0) | siblingCountN_1

// ...and for the northernmost row of the block (`leaf[0]`), where we start.

var row = leaf[0]
let westSibling = row >>> 1 | west.edges[D.E] & WEST_EDGE
let eastSibling = row <<  1 | east.edges[D.W] >>> 31

var siblingCount_0 = westSibling ^ eastSibling
var siblingCount_1 = westSibling & eastSibling

var familyCount_0 = row ^ siblingCount_0
var familyCount_1 = (row & siblingCount_0) | siblingCount_1

// The adjacent columns for the row *south* of the current index

var westS = west.edges[D.E] << 1 | southwest.corners[D.NE]
var eastS = east.edges[D.W] << 1 | southeast.corners[D.NW]

// Put the row south of the block in the extra spot at the end of the array

leaf[SIZE] = south.edges[D.N]

for (let y = 0; y < SIZE; y++) {
  // To compute the the current row, we need the data for the row south of it (`leaf[y + 1]`)
  let rowS = leaf[y + 1]
  let westSiblingS = rowS >>> 1 | westS & WEST_EDGE
  let eastSiblingS = rowS <<  1 | eastS >>> 31

  // Total living siblings (2 bits)
  let siblingCountS_0 = westSiblingS ^ eastSiblingS
  let siblingCountS_1 = westSiblingS & eastSiblingS

  // Total living family (2 bits)
  let familyCountS_0 = rowS ^ siblingCountS_0
  let familyCountS_1 = (rowS & siblingCountS_0) | siblingCountS_1

  // Get total number of adjacents cells living.
  // A cell's adjacent cells are its siblings and its cousins.
  //   siblings -> cells directly west/east of a cell
  //   cousins -> family directly north/east of a cell, i.e., the cells directly north/east and their siblings

  let xor0 = familyCountN_0 ^ familyCountS_0
  let and0 = familyCountN_0 & familyCountS_0
  let sum0 = siblingCount_0 ^ xor0
  let carry0 = (siblingCount_0 & xor0) | and0

  let xor1 = familyCountN_1 ^ familyCountS_1
  let and1 = familyCountN_1 & familyCountS_1
  let sum1 = siblingCount_1 ^ xor1
  let carry1 = (siblingCount_1 & xor1) | and1
  
  let isAlive = row
  let twoOrThreeNeighbors = (carry0 ^ sum1) & ~carry1
  let nextRow = twoOrThreeNeighbors & (isAlive | sum0)

  // Store the result
  raw[y] = nextRow

  // Cache the row data for the next iteration
  familyCountN_0 = familyCount_0
  familyCountN_1 = familyCount_1

  row = rowS
  siblingCount_0 = siblingCountS_0
  siblingCount_1 = siblingCountS_1
  familyCount_0 = familyCountS_0
  familyCount_1 = familyCountS_1

  westS <<= 1
  eastS <<= 1
}

leaf[SIZE] = 0

return raw
}

const WEST_EDGE = 0x80000000
const EAST_EDGE = 0x00000001

let CheckBounds = (x, y) => {
  let err = explanation => {throw TypeError(`Out of bounds: ${explanation} in ${[x, y]}`)}

  if (x < 0) err("x < 0")
  if (y < 0) err("y < 0")
  if (x >= SIZE) err("x >= " + SIZE)
  if (y >= SIZE) err("y >= " + SIZE)
}

// Number of set bits in a U32. See "Hacker's Delight" chapter 5
let Population = x => {
  x = (x & 0x55555555) + (x >>> 1  & 0x55555555)
  x = (x & 0x33333333) + (x >>> 2  & 0x33333333)
  x = (x & 0x0F0F0F0F) + (x >>> 4  & 0x0F0F0F0F)
  x = (x & 0x00FF00FF) + (x >>> 8  & 0x00FF00FF)
  x = (x & 0x0000FFFF) + (x >>> 16 & 0x0000FFFF)

  return x | 0
}

let _Get = (leaf, x, y) => {
  let row = leaf[y]
  let mask = WEST_EDGE >>> x

  return (row & mask) !== 0
}

let Mutate = (leaf, [x, y], state) => {
  CheckBounds(x, y)

  let row = leaf[y]
  let mask = WEST_EDGE >>> x

  leaf[y] = state ?
      row | mask
    : row & ~mask

  return leaf
}