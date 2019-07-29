import * as D from "./direction"
import {SIZE, WEST_EDGE} from "./leaf"

export let Leaf = ({Malloc}) => (
  ctx,
  leaf,
  north, south, west, east,
  northwest, northeast, southwest, southeast
) => {
  let raw = Malloc(ctx)

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

export let Branch = ({Recur: Next, Malloc}) => (
  ctx,
  branch,
  N,  S,  W,  E,
  NW, NE, SW, SE
) => {
  let raw = Malloc(ctx)
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
  
  raw[D.NW] = Next(ctx, sg5, sg1, sg9, sg4, sg6, sg0, sg2, sg8, sgA)
  raw[D.NE] = Next(ctx, sg6, sg2, sgA, sg5, sg7, sg1, sg3, sg9, sgB)
  raw[D.SW] = Next(ctx, sg9, sg5, sgD, sg8, sgA, sg4, sg6, sgC, sgE)
  raw[D.SE] = Next(ctx, sgA, sg6, sgE, sg9, sgB, sg5, sg7, sgD, sgF)

  return raw
}