import * as D from "../direction"
import {SIZE, WEST_EDGE} from "../leaf"
import * as U from "../util"

export let Leaf = function NextLeaf(
  ctx,
  leaf,
  north, south, west, east,
  northwest, northeast, southwest, southeast
) {
  let raw = ctx.Leaf.Malloc(leaf)

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

export let Branch = ({Recur: Next}) => function NextBranch(
  ctx,
  branch,
  N,  S,  W,  E,
  NW, NE, SW, SE
) {
  let size = branch.size
  for (let i = 1; i < arguments.length; i++)
    if (arguments[i].size !== size) {
      console.log(U.map(grid => grid.size)({branch, N,  S,  W,  E, NW, NE, SW, SE}))
      throw Error("Size mismatch")
    }
  let raw = ctx.Branch.Malloc(branch)
  let B = branch

  raw.size = B.size

  let subgrids = [
     NW[D.SE],
     N [D.SW],
     N [D.SE],
     NE[D.SW],

     W [D.NE],
     B [D.NW],
     B [D.NE],
     E [D.NW],

     W [D.SE],
     B [D.SW],
     B [D.SE],
     E [D.SW],

     SW[D.NE],
     S [D.NW],
     S [D.NE],
     SE[D.NW]
  ]
  
  for (let q = 0; q < 4; q++) {
    let xOffset = 1 + (q & 1)      // [1, 2, 1, 2]
      , yOffset = 2 + (q & 2) << 1 // [4, 4, 8, 8]
      , _ = xOffset + yOffset
      , N = -4
      , S =  4
      , W = -1
      , E =  1
      , sg = subgrids
    
    raw[q] = Next(
      ctx,
      sg[_],
      sg[_ + N],
      sg[_ + S],
      sg[_ + W],
      sg[_ + E],
      sg[_ + N + W],
      sg[_ + N + E],
      sg[_ + S + W],
      sg[_ + S + E])
  }

  return raw
}