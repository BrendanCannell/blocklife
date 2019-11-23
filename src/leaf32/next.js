import * as D from "../direction"
import {SIZE, WEST_EDGE} from "./constants"

export default ({Allocate}) =>
  function LeafNext(
    leaf,
    N, S, W, E,
    NW, NE, SW, SE
  ) {
    let raw = Allocate(leaf)

    // Set up row data for the row just north of the block (`north.south`)...
      , rowN = N.edges[D.S]
      , westSiblingN = rowN >>> 1 | NW.corners[D.SE] << SIZE - 1
      , eastSiblingN = rowN <<  1 | NE.corners[D.SW]
      , siblingCountN_0 = westSiblingN ^ eastSiblingN
      , siblingCountN_1 = westSiblingN & eastSiblingN
      , familyCountN_0 = rowN ^ siblingCountN_0
      , familyCountN_1 = (rowN & siblingCountN_0) | siblingCountN_1

    // ...and for the northernmost row of the block (`leaf[0]`), where we start.
      , row = leaf[0]
      , westSibling = row >>> 1 | W.edges[D.E] & WEST_EDGE
      , eastSibling = row <<  1 | E.edges[D.W] >>> 31
      , siblingCount_0 = westSibling ^ eastSibling
      , siblingCount_1 = westSibling & eastSibling
      , familyCount_0 = row ^ siblingCount_0
      , familyCount_1 = (row & siblingCount_0) | siblingCount_1

    // The adjacent columns for the row *south* of the current index
      , westS = W.edges[D.E] << 1 | SW.corners[D.NE]
      , eastS = E.edges[D.W] << 1 | SE.corners[D.NW]

    // Put the row south of the block in the extra spot at the end of the array

    leaf[SIZE] = S.edges[D.N]

    for (let y = 0; y < SIZE; y++) {
      // To compute the the current row, we need the data for the row south of it (`leaf[y + 1]`)
      let rowS = leaf[y + 1]
        , westSiblingS = rowS >>> 1 | westS & WEST_EDGE
        , eastSiblingS = rowS <<  1 | eastS >>> 31

      // Total living siblings (2 bits)
        , siblingCountS_0 = westSiblingS ^ eastSiblingS
        , siblingCountS_1 = westSiblingS & eastSiblingS

      // Total living family (2 bits)
        , familyCountS_0 = rowS ^ siblingCountS_0
        , familyCountS_1 = (rowS & siblingCountS_0) | siblingCountS_1

      // Total living neighbors, first bit/carry
        , xor0 = familyCountN_0 ^ familyCountS_0
        , and0 = familyCountN_0 & familyCountS_0
        , sum0 = siblingCount_0 ^ xor0
        , carry0 = (siblingCount_0 & xor0) | and0

      // Total living neighbors, second bit/carry
        , xor1 = familyCountN_1 ^ familyCountS_1
        , and1 = familyCountN_1 & familyCountS_1
        , sum1 = siblingCount_1 ^ xor1
        , carry1 = (siblingCount_1 & xor1) | and1
      
      // B3S23
        , isAlive = row
        , twoOrThreeNeighbors = (carry0 ^ sum1) & ~carry1
        , nextRow = twoOrThreeNeighbors & (isAlive | sum0)

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

      // Shift the border into positon for the next iteration
      westS <<= 1
      eastS <<= 1
    }

    leaf[SIZE] = 0

    return raw
  }