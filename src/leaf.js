import * as H from "./hash"
import * as E from "./edge"
import * as Q from "./quadrant"

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

  leaf.edges[E.N] = leaf[0]
  leaf.edges[E.S] = leaf[31]
  leaf.edges[E.W] = west
  leaf.edges[E.E] = east
  
  leaf.corners[Q.NW] = west >>> 31
  leaf.corners[Q.NE] = east >>> 31
  leaf.corners[Q.SW] = west & 1
  leaf.corners[Q.SE] = east & 1

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

export let Copy = (raw = Malloc(), leaf) => {
  for (let i = 0; i < SIZE; i++)
    raw[i] = leaf[i]
  
  return raw
}

export let FromLiving = (raw = Malloc(), locations) => {
  for (let loc of locations)
    Mutate(raw, loc, true)

  return raw
}

export let Set = (raw = Malloc(), leaf, pairs) => {
  for (let i = 0; i < SIZE; i++)
    raw[i] = leaf[i]
  
  for (let [loc, state] of pairs)
    Mutate(raw, loc, state)

  return raw
}

let rowDataN = new Int32Array(5)
let rowData  = new Int32Array(5)
let rowDataS = new Int32Array(5)

export let Next = (
    raw = Malloc(),
    {
      node: leaf,
      edges: [north, south, west, east],
      corners: [northwest, northeast, southwest, southeast]
    }
  ) => {

  // Set up row data for the row just north of the block (`north.south`)...

  PutRowData(
    rowDataN,
    north,
    northwest << SIZE - 1,
    northeast
  )

  // ...and for the northernmost row of the block (`leaf[0]`), where we start.

  PutRowData(
    rowData,
    leaf[0],
    west & WEST_EDGE,
    east >>> SIZE - 1
  )

  // The adjacent columns for the row *south* of the current index

  var westEdgeS = west << 1 | southwest
  var eastEdgeS = east << 1 | southeast

  // Put the row south of the block in the extra spot at the end of the array

  leaf[SIZE] = south

  for (let y = 0; y < SIZE; y++) {
    // To compute the the current row, we need the data for the row south of it (`leaf[y + 1]`)
    PutRowData(
      rowDataS,
      leaf[y + 1],
      westEdgeS & WEST_EDGE,
      eastEdgeS >>> 31
    )

    // Get total number of adjacents cells living.
    // A cell's adjacent cells are its siblings and its cousins.
    //   siblings -> cells directly west/east of a cell
    //   cousins -> family directly north/east of a cell, i.e., the cells directly north/east and their siblings

    let siblings_0 = rowData[1]
    let cousinsN_0 = rowDataN[3]
    let cousinsS_0 = rowDataS[3]
    let [b0, c0] = Add3(siblings_0, cousinsN_0, cousinsS_0)

    let siblings_1 = rowData[2]
    let cousinsN_1  = rowDataN[4]
    let cousinsS_1  = rowDataS[4]
    let [b1, c1] = Add3(siblings_1, cousinsN_1, cousinsS_1)
    
    let isAlive = rowData[0]
    let twoOrThreeNeighbors = (c0 ^ b1) & ~c1
    let nextRow = twoOrThreeNeighbors & (isAlive | b0)

    // Store the result
    raw[y] = nextRow

    // Cache the row data for the next iteration
    let tmp = rowDataN
    rowDataN = rowData
    rowData  = rowDataS
    rowDataS = tmp

    westEdgeS <<= 1
    eastEdgeS <<= 1
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

// siblings -> cells directly west/east of a cell
// family -> a cell and its sibling
let PutRowData = (data, row, westBorder, eastBorder) => {
  let cell = row
  let westSibling = row >>> 1 | westBorder
  let eastSibling = row <<  1 | eastBorder

  // Total living siblings (2 bits)
  let siblingCount_0 = westSibling ^ eastSibling
  let siblingCount_1 = westSibling & eastSibling

  // Total living family (2 bits)
  let familyCount_0 = cell ^ siblingCount_0
  let familyCount_1 = (cell & siblingCount_0) | siblingCount_1

  data[0] = cell
  data[1] = siblingCount_0
  data[2] = siblingCount_1
  data[3] = familyCount_0
  data[4] = familyCount_1
}

let Add3 = (x, y, z) => {
  let xor = y ^ z
  let and = y & z
  let sum = x ^ xor
  let carry = (x & xor) | and

  return [sum, carry]
}