import * as H from "./hash"

export const SIZE = 32

export let Malloc = () => ({
  size: SIZE,
  rows: new Int32Array(SIZE + 1),
  north: 0,
  south: 0,
  west: 0,
  east: 0,
  northwest: 0,
  northeast: 0,
  southwest: 0,
  southeast: 0,
  hash: 0,
  population: 0
})
  
export let AddTo = () => ({rows}, {data, Offset, divisions, mask}, x, y) => {
  divisions = divisions | 0; mask = mask | 0;

  let base = Offset(x, y) | 0
  
  for (let y = 0; y < SIZE; y++) {
    let offset = base + y * divisions

    for (let d = 0; d < divisions; d++) {
      data[offset + d] += rows[y] >>> d & mask
    }
  }

  return data
}

export let Get = () => ({rows}, [x, y]) => {
  CheckBounds(x, y)

  return _Get(rows, x, y)
}

export let Living = () => function*({rows}) {
  for (let y = 0; y < SIZE; y++)
    for (let x = 0; x < SIZE; x++)
      if (_Get(rows, x, y) === true)
        yield [x, y]
}

export let Equal = () => ({rows: r1, hash: h1}, {rows: r2, hash: h2}) => {
  if (r1 === r2) return true
  if (h1 !== h2) return false
  
  for (let i = 0; i < SIZE; i++)
    if (r1[i] !== r2[i]) return false
  
  return true
}

export let Copy = ({Malloc: M = Malloc()}) => ({rows}) => {
  let raw = M()

  for (let i = 0; i < SIZE; i++)
    raw.rows[i] = rows[i]
  
  return UpdateDerived(raw)
}

export let FromLiving = ({Malloc: M = Malloc()}) => (locations) => {
  let raw = M()

  for (let loc of locations)
    Mutate(raw.rows, loc, true)

  return UpdateDerived(raw)
}

export let Set = ({Malloc: M = Malloc()}) => ({rows}, pairs) => {
  let raw = M()

  for (let i = 0; i < SIZE; i++)
    raw.rows[i] = rows[i]
  
  for (let [loc, state] of pairs)
    Mutate(raw.rows, loc, state)

  return UpdateDerived(raw)
}

let rowDataN = new Int32Array(5)
let rowData  = new Int32Array(5)
let rowDataS = new Int32Array(5)

export let Next = ({Malloc: M = Malloc()}) => (
    {rows},
    {south: north},
    {north: south},
    {east: west},
    {west: east},
    {southeast: northwest},
    {southwest: northeast},
    {northeast: southwest},
    {northwest: southeast}) => {

  let raw = M()

  // Set up row data for the row just north of the block (`north.south`)...

  PutRowData(
    rowDataN,
    north,
    northwest << SIZE - 1,
    northeast
  )

  // ...and for the northernmost row of the block (`rows[0]`), where we start.

  PutRowData(
    rowData,
    rows[0],
    west & WEST_EDGE,
    east >>> SIZE - 1
  )

  // The adjacent columns for the row *south* of the current index

  var westEdgeS = west << 1 | southwest
  var eastEdgeS = east << 1 | southeast

  // Put the row south of the block in the extra spot at the end of the array

  rows[SIZE] = south

  for (let y = 0; y < SIZE; y++) {
    // To compute the the current row, we need the data for the row south of it (`rows[y + 1]`)
    PutRowData(
      rowDataS,
      rows[y + 1],
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
    raw.rows[y] = nextRow

    // Cache the row data for the next iteration
    let tmp = rowDataN
    rowDataN = rowData
    rowData  = rowDataS
    rowDataS = tmp

    westEdgeS <<= 1
    eastEdgeS <<= 1
  }

  rows[SIZE] = 0

  return UpdateDerived(raw)
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
let population = x => {
  x = (x & 0x55555555) + (x >>> 1  & 0x55555555)
  x = (x & 0x33333333) + (x >>> 2  & 0x33333333)
  x = (x & 0x0F0F0F0F) + (x >>> 4  & 0x0F0F0F0F)
  x = (x & 0x00FF00FF) + (x >>> 8  & 0x00FF00FF)
  x = (x & 0x0000FFFF) + (x >>> 16 & 0x0000FFFF)

  return x | 0
}

let _Get = (rows, x, y) => {
  let row = rows[y]
  let mask = WEST_EDGE >>> x

  return (row & mask) !== 0
}

let Mutate = (rows, [x, y], state) => {
  CheckBounds(x, y)

  let row = rows[y]
  let mask = WEST_EDGE >>> x

  rows[y] = state ?
      row | mask
    : row & ~mask

  return rows
}

let UpdateDerived = leaf => {
  var west = 0
  var east = 0
  var hash = SIZE * 4
  var pop = 0

  for (let i = 0; i < SIZE; i++) {
    let row = leaf.rows[i]
    
    west |= (row & WEST_EDGE) >>> i
    east |= (row & EAST_EDGE) <<  31 - i

    pop += population(row)
    hash = H.reducer(hash, row)
  }

  leaf.north = leaf.rows[0]
  leaf.south = leaf.rows[31]
  leaf.west  = west
  leaf.east  = east
  leaf.northwest = west >>> 31
  leaf.northeast = east >>> 31
  leaf.southwest = west & 1
  leaf.southeast = east & 1

  leaf.hash = H.finalize(hash)
  leaf.population = pop

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