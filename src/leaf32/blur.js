import * as U from "../util"
import {SIZE} from "./constants"

function LeafNew({maxSteps}) {
  let divisionCount = U.ceilPow2(maxSteps)
    , rowToDivisionMask = 0
    , divisionToCellMask = 0
  for (let i = 0; i < SIZE; i += divisionCount)
    rowToDivisionMask = rowToDivisionMask | 1 << i
  for (let d = divisionCount; d--;)
    divisionToCellMask = divisionToCellMask | 1 << d
  return {
    sizeCoefficient: divisionCount,
    leafDerived: {
      divisionCount,
      rowToDivisionMask,
      divisionToCellMask
    }
  }
}
  
let Add = () => function LeafAdd(_size, leaf, leafOffset, blurData) {
  let {buffer, leafDerived} = blurData
    , {divisionCount, rowToDivisionMask} = leafDerived
  divisionCount |= 0; leafOffset |= 0; rowToDivisionMask |= 0
  for (let y = 0; y < SIZE; y++) {
    let rowOffset = leafOffset + y * divisionCount | 0
    for (let d = 0; d < divisionCount; d++)
      buffer[rowOffset + d] += leaf[y] >>> d & rowToDivisionMask
  }
  return blurData
}
  
function Get(leafOffset, dx, dy, blurData) {
  let {buffer, leafDerived} = blurData
    , {divisionCount, divisionToCellMask} = leafDerived
    , rowOffset = leafOffset + dy * divisionCount
    , columnOffset = 31 - dx
    , divIndex = columnOffset % divisionCount
    , divOffset = rowOffset + divIndex
    , div = buffer[divOffset]
    , divColumnOffset = U.floorBy(divisionCount, columnOffset)
    , blur = divisionToCellMask & (div >>> divColumnOffset)
  return blur
}

export default {Add, New: LeafNew, Get}